"use node";
/* eslint-disable @typescript-eslint/no-explicit-any */
// The Better Auth Convex component adapter is dynamically typed; the seed
// utility intentionally uses `any` to call its generic adapter mutations.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { createAuth } from "./auth";
import { hashPassword } from "better-auth/crypto";

export const exampleLogins = action({
  args: {
    accounts: v.array(
      v.object({
        roleKey: v.string(),
        roleLabel: v.string(),
        email: v.string(),
        password: v.string(),
        name: v.string(),
      }),
    ),
  },
  returns: v.object({
    ok: v.boolean(),
    accounts: v.array(
      v.object({
        roleKey: v.string(),
        email: v.string(),
        status: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const auth = createAuth(ctx as never);
    const results: Array<{ roleKey: string; email: string; status: string }> =
      [];

    for (const account of args.accounts) {
      const existing: any = await ctx.runQuery(
        (components as any).betterAuth.adapter.findOne,
        {
          model: "user",
          where: [{ field: "email", value: account.email, operator: "eq" }],
        },
      );
      const legacyByName: any = await ctx.runQuery(
        (components as any).betterAuth.adapter.findMany,
        {
          model: "user",
          where: [
            { field: "name", value: account.name, operator: "eq" },
            { field: "email", value: "@specode.ai", operator: "ends_with" },
          ],
          paginationOpts: { cursor: null, numItems: 100 },
        },
      );
      const exactUserId = existing?._id ?? null;
      const usersToDelete = new Map<string, any>();
      for (const candidate of legacyByName.page ?? []) {
        if (candidate?._id && candidate._id !== exactUserId) {
          usersToDelete.set(candidate._id, candidate);
        }
      }

      for (const stale of usersToDelete.values()) {
        await ctx.runMutation((components as any).betterAuth.adapter.deleteMany, {
          input: {
            model: "account",
            where: [{ field: "userId", value: stale._id, operator: "eq" }],
          },
          paginationOpts: { cursor: null, numItems: 100 },
        });
        await ctx.runMutation((components as any).betterAuth.adapter.deleteMany, {
          input: {
            model: "session",
            where: [{ field: "userId", value: stale._id, operator: "eq" }],
          },
          paginationOpts: { cursor: null, numItems: 100 },
        });
        await ctx.runMutation((components as any).betterAuth.adapter.deleteMany, {
          input: {
            model: "twoFactor",
            where: [{ field: "userId", value: stale._id, operator: "eq" }],
          },
          paginationOpts: { cursor: null, numItems: 100 },
        });
        await ctx.runMutation((components as any).betterAuth.adapter.deleteOne, {
          input: {
            model: "user",
            where: [{ field: "_id", value: stale._id, operator: "eq" }],
          },
        });
      }

      if (exactUserId) {
        const passwordHash = await hashPassword(account.password);
        const credentialAccounts: any = await ctx.runQuery(
          (components as any).betterAuth.adapter.findMany,
          {
            model: "account",
            where: [
              { field: "userId", value: exactUserId, operator: "eq" },
              { field: "providerId", value: "credential", operator: "eq" },
            ],
            paginationOpts: { cursor: null, numItems: 10 },
          },
        );

        await ctx.runMutation((components as any).betterAuth.adapter.deleteMany, {
          input: {
            model: "session",
            where: [{ field: "userId", value: exactUserId, operator: "eq" }],
          },
          paginationOpts: { cursor: null, numItems: 100 },
        });
        await ctx.runMutation((components as any).betterAuth.adapter.deleteMany, {
          input: {
            model: "twoFactor",
            where: [{ field: "userId", value: exactUserId, operator: "eq" }],
          },
          paginationOpts: { cursor: null, numItems: 100 },
        });
        await ctx.runMutation((components as any).betterAuth.adapter.deleteMany, {
          input: {
            model: "verification",
            where: [{ field: "value", value: exactUserId, operator: "eq" }],
          },
          paginationOpts: { cursor: null, numItems: 100 },
        });
        await ctx.runMutation((components as any).betterAuth.adapter.updateOne, {
          input: {
            model: "user",
            where: [{ field: "_id", value: exactUserId, operator: "eq" }],
            update: {
              name: account.name,
              twoFactorEnabled: false,
              updatedAt: Date.now(),
            },
          },
        });

        if ((credentialAccounts.page ?? []).length > 0) {
          for (const credentialAccount of credentialAccounts.page ?? []) {
            if (!credentialAccount?._id) continue;
            await ctx.runMutation(
              (components as any).betterAuth.adapter.updateOne,
              {
                input: {
                  model: "account",
                  where: [
                    { field: "_id", value: credentialAccount._id, operator: "eq" },
                  ],
                  update: { password: passwordHash, updatedAt: Date.now() },
                },
              },
            );
          }
        } else {
          await ctx.runMutation((components as any).betterAuth.adapter.create, {
            input: {
              model: "account",
              data: {
                accountId: exactUserId,
                providerId: "credential",
                userId: exactUserId,
                password: passwordHash,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
          });
        }

        results.push({
          roleKey: account.roleKey,
          email: account.email,
          status: usersToDelete.size > 0 ? "rotated" : "reset",
        });
        continue;
      }

      try {
        await auth.api.signUpEmail({
          body: {
            email: account.email,
            password: account.password,
            name: account.name,
          },
        });
        results.push({
          roleKey: account.roleKey,
          email: account.email,
          status: usersToDelete.size > 0 ? "rotated" : "created",
        });
      } catch (err) {
        console.error(
          "seed signUp failed",
          account.email,
          err instanceof Error ? err.message : String(err),
        );
        results.push({
          roleKey: account.roleKey,
          email: account.email,
          status: "error",
        });
      }
    }

    return { ok: true, accounts: results };
  },
});
