import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Intake section identifiers, in funnel order.
export const intakeSectionValidator = v.union(
  v.literal("personal"),
  v.literal("contact"),
  v.literal("medical-history"),
  v.literal("allergies"),
  v.literal("medications"),
  v.literal("consent"),
);

// A single allergy row collected in the Allergies intake section.
const allergyRowValidator = v.object({
  type: v.union(
    v.literal("medication"),
    v.literal("food"),
    v.literal("environmental"),
    v.literal("other"),
  ),
  detail: v.string(),
  severity: v.union(
    v.literal("mild"),
    v.literal("moderate"),
    v.literal("severe"),
  ),
});

// A single medication row collected in the Medications intake section.
const medicationRowValidator = v.object({
  name: v.string(),
  dosage: v.string(),
  frequency: v.string(),
  prescriber: v.string(),
});

export default defineSchema({
  // Existing scaffold table (HIPAA audit posture). Not wired in this slice.
  audit_logs: defineTable({
    actor_id: v.optional(v.string()),
    action: v.union(v.literal("PHI_READ"), v.literal("PHI_WRITE")),
    resource_type: v.string(),
    resource_id: v.string(),
    patient_id: v.optional(v.string()),
    metadata: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
    ),
  })
    .index("by_actor", ["actor_id"])
    .index("by_patient", ["patient_id"])
    .index("by_resource_type_and_resource_id", ["resource_type", "resource_id"]),

  // Peptide product catalog.
  products: defineTable({
    slug: v.string(),
    name: v.string(),
    // Short scientific / alternate identifier shown as an eyebrow.
    shortName: v.string(),
    category: v.string(),
    // One-line summary used on catalog cards.
    tagline: v.string(),
    // Longer marketing description on the detail page.
    description: v.string(),
    // Bullet benefits.
    benefits: v.array(v.string()),
    // The condition/use-case this peptide targets (drives intake framing).
    condition: v.string(),
    priceCents: v.number(),
    // Cadence label, e.g. "per month".
    priceCadence: v.string(),
    imageUrl: v.string(),
    // Whether it appears in the catalog.
    active: v.boolean(),
    // Display ordering, lower first.
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_and_sortOrder", ["active", "sortOrder"]),

  // One patient record per authenticated user. Created on the first intake step.
  patients: defineTable({
    authUserId: v.string(),

    // Personal section
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    sex: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),

    // Contact section
    phone: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),

    // Medical history section
    conditions: v.optional(v.string()),
    priorSurgeries: v.optional(v.string()),
    familyHistory: v.optional(v.string()),

    // Allergies section
    hasNoAllergies: v.optional(v.boolean()),
    allergies: v.optional(v.array(allergyRowValidator)),

    // Medications section
    takesNoMedications: v.optional(v.boolean()),
    medications: v.optional(v.array(medicationRowValidator)),

    // Consent section
    consentTelehealth: v.optional(v.boolean()),
    consentPrivacy: v.optional(v.boolean()),
    consentTerms: v.optional(v.boolean()),
    consentAccuracy: v.optional(v.boolean()),

    // Funnel progress tracking
    currentSection: intakeSectionValidator,
    completedSections: v.array(intakeSectionValidator),
    intakeComplete: v.boolean(),
  }).index("by_authUserId", ["authUserId"]),

  // An order is created when an intake funnel completes for a product.
  // After intake the patient is sent into Stripe Checkout to AUTHORIZE
  // (manual-capture) payment. The order stays in "pending_review" while the
  // authorization hold is open; capture/void happens on provider decision in
  // a later iteration (see convex/billing/stripe.ts).
  orders: defineTable({
    authUserId: v.string(),
    patientId: v.id("patients"),
    productId: v.id("products"),
    // Denormalized snapshot for stable display.
    productName: v.string(),
    productCondition: v.string(),
    priceCents: v.number(),
    // Order lifecycle status. Remains "pending_review" once payment is
    // authorized; provider approval/denial is a later iteration.
    status: v.union(
      v.literal("intake_complete"),
      v.literal("order_placed"),
      v.literal("pending_review"),
    ),
    // Payment / authorization state, tracked separately from the clinical
    // lifecycle status. "authorized" = funds held but NOT captured.
    payment: v.union(
      v.literal("unpaid"), // order created, checkout not yet completed
      v.literal("authorized"), // Stripe hold placed, awaiting provider decision
      v.literal("captured"), // funds taken (on provider approval — later iteration)
      v.literal("voided"), // hold released (on denial/expiry — later iteration)
      v.literal("failed"), // payment attempt failed
    ),
    // Stripe references for reconciliation and later capture/void.
    stripeSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_patient", ["patientId"])
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_stripePaymentIntentId", ["stripePaymentIntentId"]),

  // Transactional email send log (AC5). Stores ONLY non-sensitive metadata:
  // never the email body/HTML, subject content, or any code/link inside it.
  emailLog: defineTable({
    messageId: v.union(v.string(), v.null()),
    to: v.string(),
    template: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("skipped"),
      v.literal("error"),
    ),
    // Rate-limiting metadata (AC4).
    tag: v.string(),
    timestamp: v.number(),
  })
    .index("by_to", ["to"])
    .index("by_template", ["template"])
    .index("by_timestamp", ["timestamp"]),
});
