import Stripe from "stripe";
import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Stripe webhook handler. Runs in the Convex HTTP (V8) runtime and verifies
// signatures with the Web Crypto API via constructEventAsync (no Node crypto),
// so it does NOT need a "use node" module.
//
// Idempotency: every handler below routes through internal mutations that
// no-op when an order is already in a terminal/forward state, so Stripe's
// automatic retries and duplicate deliveries are safe.
//
// Only the events the handler actually processes are switched on; the user is
// told to subscribe to exactly this set when registering the endpoint.
export const stripeWebhook = httpAction(async (ctx, request) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Not configured yet: acknowledge without crashing so the deploy stays
  // healthy before keys are added in Project Settings.
  if (!secretKey || !webhookSecret) {
    return new Response("Stripe is not configured.", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  const payload = await request.text();
  const stripe = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      // For manual-capture checkout, a completed session means the
      // authorization hold was placed successfully.
      if (paymentIntentId) {
        await ctx.runMutation(internal.billing.orders.markAuthorized, {
          sessionId: session.id,
          paymentIntentId,
        });
      }
      break;
    }

    case "payment_intent.succeeded": {
      // With manual capture, "succeeded" fires when the hold is captured;
      // with the hold still open Stripe reports requires_capture. Either way,
      // recording the intent + authorized state is safe and idempotent.
      const intent = event.data.object as Stripe.PaymentIntent;
      await ctx.runMutation(internal.billing.orders.markAuthorized, {
        sessionId: undefined,
        paymentIntentId: intent.id,
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await ctx.runMutation(internal.billing.orders.markFailed, {
        sessionId: undefined,
        paymentIntentId: intent.id,
      });
      break;
    }

    default:
      // Ignore unsubscribed event types.
      break;
  }

  return new Response(null, { status: 200 });
});
