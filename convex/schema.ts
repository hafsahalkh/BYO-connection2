import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  audit_logs: defineTable({
    actor_id: v.optional(v.string()),
    action: v.union(v.literal("PHI_READ"), v.literal("PHI_WRITE")),
    resource_type: v.string(),
    resource_id: v.string(),
    patient_id: v.optional(v.string()),
    metadata: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))
    ),
  })
    .index("by_actor", ["actor_id"])
    .index("by_patient", ["patient_id"])
    .index("by_resource_type_and_resource_id", ["resource_type", "resource_id"]),
});
