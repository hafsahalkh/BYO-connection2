import { internalQuery, internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { v } from "convex/values";

// Internal data helpers used by the billing action + webhook. Kept separate
// from public order queries so all payment-mutating logic stays app-owned and
// idempotent.

const paymentValidator = v.union(
  v.literal("unpaid"),
  v.literal("authorized"),
  v.literal("captured"),
  v.literal("voided"),
  v.literal("failed"),
);

// Fetch the minimal order context needed to build a checkout session.
export const getOrderForCheckout = internalQuery({
  args: { orderId: v.id("orders") },
  returns: v.union(
    v.object({
      _id: v.id("orders"),
      authUserId: v.string(),
      productName: v.string(),
      productCondition: v.string(),
      priceCents: v.number(),
      payment: paymentValidator,
      stripeSessionId: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    return {
      _id: order._id,
      authUserId: order.authUserId,
      productName: order.productName,
      productCondition: order.productCondition,
      priceCents: order.priceCents,
      payment: order.payment,
      stripeSessionId: order.stripeSessionId,
    };
  },
});

// Record the Stripe session id on the order before redirecting to checkout.
export const attachCheckoutSession = internalMutation({
  args: {
    orderId: v.id("orders"),
    stripeSessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(order._id, { stripeSessionId: args.stripeSessionId });
    return null;
  },
});

// Idempotently mark an order's authorization as placed. Safe to call multiple
// times for the same Stripe event (webhook retries / duplicate events): once an
// order is captured/voided we never downgrade it back to authorized.
export const markAuthorized = internalMutation({
  args: {
    sessionId: v.optional(v.string()),
    paymentIntentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await findOrder(ctx, args.sessionId, args.paymentIntentId);
    if (!order) return null;

    // Idempotency: only transition from unpaid/failed; never overwrite a
    // captured or voided terminal state.
    if (order.payment === "captured" || order.payment === "voided") {
      return null;
    }

    await ctx.db.patch(order._id, {
      payment: "authorized",
      stripePaymentIntentId: args.paymentIntentId,
      ...(args.sessionId ? { stripeSessionId: args.sessionId } : {}),
    });
    return null;
  },
});

// Idempotently mark an order's payment as failed.
export const markFailed = internalMutation({
  args: {
    sessionId: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await findOrder(ctx, args.sessionId, args.paymentIntentId);
    if (!order) return null;

    // Never overwrite a successful/terminal state with "failed".
    if (
      order.payment === "authorized" ||
      order.payment === "captured" ||
      order.payment === "voided"
    ) {
      return null;
    }

    await ctx.db.patch(order._id, {
      payment: "failed",
      ...(args.paymentIntentId
        ? { stripePaymentIntentId: args.paymentIntentId }
        : {}),
    });
    return null;
  },
});

// Resolve an order by Stripe session id first, then by payment intent id.
async function findOrder(
  ctx: MutationCtx,
  sessionId: string | undefined,
  paymentIntentId: string | undefined,
): Promise<Doc<"orders"> | null> {
  if (sessionId) {
    const bySession = await ctx.db
      .query("orders")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", sessionId),
      )
      .unique();
    if (bySession) return bySession;
  }
  if (paymentIntentId) {
    const byIntent = await ctx.db
      .query("orders")
      .withIndex("by_stripePaymentIntentId", (q) =>
        q.eq("stripePaymentIntentId", paymentIntentId),
      )
      .unique();
    if (byIntent) return byIntent;
  }
  return null;
}
