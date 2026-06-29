import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "../_generated/server";

export const auditActionValidator = v.union(
  v.literal("PHI_READ"),
  v.literal("PHI_WRITE"),
);

const auditMetadataValidator = v.optional(
  v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
);

const auditArgs = {
  action: auditActionValidator,
  resource_type: v.string(),
  resource_id: v.string(),
  patient_id: v.optional(v.string()),
  metadata: auditMetadataValidator,
};

export type AuditAction = "PHI_READ" | "PHI_WRITE";

export type AuditLogInput = {
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  patient_id?: string;
  metadata?: Record<string, string | number | boolean>;
};

// Insert one audit_logs row. Call directly from any mutation handler.
// Do NOT pass PHI in `metadata` — values are stored as-is.
//
// When actor_id === patient_id, metadata.self_access is set to true
// automatically. Projects where auth user id and patient id live in
// different namespaces should pass `metadata: { self_access: true }`
// explicitly when the caller is reading their own record.
//
// For the action-wrapper recipe used on PHI reads, load the
// audit-logging skill.
export async function recordAuditLog(
  ctx: MutationCtx,
  args: AuditLogInput,
): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  const actor_id = identity?.subject;

  const isSelfAccess =
    actor_id !== undefined &&
    args.patient_id !== undefined &&
    actor_id === args.patient_id;

  const metadata = isSelfAccess
    ? { ...(args.metadata ?? {}), self_access: true }
    : args.metadata;

  await ctx.db.insert("audit_logs", {
    actor_id,
    action: args.action,
    resource_type: args.resource_type,
    resource_id: args.resource_id,
    patient_id: args.patient_id,
    metadata,
  });
}

// Internal mutation wrapper so an action can write an audit row via
// ctx.runMutation(internal.lib.audit._record, { ... }).
// Used by the action-wrapper pattern for PHI reads — load the
// audit-logging skill for the full recipe.
export const _record = internalMutation({
  args: auditArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await recordAuditLog(ctx, args);
    return null;
  },
});
