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
