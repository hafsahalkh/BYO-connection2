"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { createAuthorizationCheckout } from "./stripe";

// Public action: start Stripe Checkout to AUTHORIZE payment for an order the
// patient just placed. Returns the hosted checkout URL for the client to
// redirect to. Gracefully surfaces a clear error (not a crash) when Stripe is
// not yet configured, so the app still builds/runs in preview pre-keys.
export const startCheckout = action({
  args: {
    orderId: v.id("orders"),
    // Base app origin (e.g. the deployed preview URL) so the post-checkout
    // redirects land back in the app. Stripe checkout itself does not load in
    // the Specode preview pane — it must be tested on the deployed URL.
    origin: v.string(),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args) => {
    // Authn: the action must run for a signed-in patient who owns the order.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to check out.");
    }

    const order = await ctx.runQuery(internal.billing.orders.getOrderForCheckout, {
      orderId: args.orderId,
    });
    if (!order) {
      throw new Error("Order not found.");
    }
    if (order.authUserId !== identity.subject) {
      throw new Error("You do not have access to this order.");
    }

    // Already authorized/captured — nothing to pay. Let the client route to the
    // confirmation view instead of opening a second checkout.
    if (order.payment === "authorized" || order.payment === "captured") {
      throw new Error("This order has already been authorized.");
    }

    const base = args.origin.replace(/\/+$/, "");
    const successUrl = `${base}/orders?checkout=success&order=${order._id}`;
    const cancelUrl = `${base}/orders?checkout=cancel&order=${order._id}`;

    const { sessionId, url } = await createAuthorizationCheckout({
      orderId: order._id,
      amountCents: order.priceCents,
      customerEmail: identity.email ?? undefined,
      successUrl,
      cancelUrl,
    });

    await ctx.runMutation(internal.billing.orders.attachCheckoutSession, {
      orderId: order._id,
      stripeSessionId: sessionId,
    });

    return { url };
  },
});
