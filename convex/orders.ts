import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./lib/authUser";

const orderReturnValidator = v.object({
  _id: v.id("orders"),
  _creationTime: v.number(),
  authUserId: v.string(),
  patientId: v.id("patients"),
  productId: v.id("products"),
  productName: v.string(),
  productCondition: v.string(),
  priceCents: v.number(),
  status: v.union(
    v.literal("intake_complete"),
    v.literal("order_placed"),
    v.literal("pending_review"),
  ),
  payment: v.union(
    v.literal("unpaid"),
    v.literal("authorized"),
    v.literal("captured"),
    v.literal("voided"),
    v.literal("failed"),
  ),
  stripeSessionId: v.optional(v.string()),
  stripePaymentIntentId: v.optional(v.string()),
});

// All orders for the signed-in patient, newest first.
export const listMine = query({
  args: {},
  returns: v.array(orderReturnValidator),
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
      .order("desc")
      .collect();
  },
});

// A single order owned by the signed-in patient. Used by the post-intake
// checkout hand-off and the confirmation view. Returns null if missing or
// not owned by the caller.
export const getMine = query({
  args: { orderId: v.id("orders") },
  returns: v.union(orderReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;
    const order = await ctx.db.get(args.orderId);
    if (!order || order.authUserId !== authUserId) return null;
    return order;
  },
});
