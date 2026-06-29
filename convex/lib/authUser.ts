import type { QueryCtx, MutationCtx } from "../_generated/server";

// Returns the authenticated Better Auth user id (the identity subject),
// or null when the request is unauthenticated.
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

// Same as getAuthUserId but throws when unauthenticated. Use in mutations
// that must never run for anonymous callers.
export async function requireAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}
