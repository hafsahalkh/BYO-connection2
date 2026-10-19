// Persistence for the transactional-email send log (AC5).
//
// Only non-sensitive metadata is ever written here: messageId, recipient,
// template key, status, a rate-limiting tag, and the timestamp. The email body,
// subject content, OTP codes, and reset links are NEVER persisted or logged.

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const record = internalMutation({
  args: {
    messageId: v.union(v.string(), v.null()),
    to: v.string(),
    template: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("skipped"),
      v.literal("error"),
    ),
    tag: v.string(),
    timestamp: v.number(),
  },
  returns: v.id("emailLog"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailLog", {
      messageId: args.messageId,
      to: args.to,
      template: args.template,
      status: args.status,
      tag: args.tag,
      timestamp: args.timestamp,
    });
  },
});

// Lightweight recent-sends query for verification/debugging. Metadata only.
export const recent = internalQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("emailLog"),
      _creationTime: v.number(),
      messageId: v.union(v.string(), v.null()),
      to: v.string(),
      template: v.string(),
      status: v.union(
        v.literal("sent"),
        v.literal("skipped"),
        v.literal("error"),
      ),
      tag: v.string(),
      timestamp: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailLog")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 20);
  },
});
