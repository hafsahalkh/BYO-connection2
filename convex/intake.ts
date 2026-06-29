import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, requireAuthUserId } from "./lib/authUser";
import { intakeSectionValidator } from "./schema";
import type { Doc } from "./_generated/dataModel";

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

const medicationRowValidator = v.object({
  name: v.string(),
  dosage: v.string(),
  frequency: v.string(),
  prescriber: v.string(),
});

// Section order used to compute the resume target and completion.
const SECTION_ORDER = [
  "personal",
  "contact",
  "medical-history",
  "allergies",
  "medications",
  "consent",
] as const;
type Section = (typeof SECTION_ORDER)[number];

const patientReturnValidator = v.object({
  _id: v.id("patients"),
  _creationTime: v.number(),
  authUserId: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  dateOfBirth: v.optional(v.string()),
  sex: v.optional(v.string()),
  preferredLanguage: v.optional(v.string()),
  phone: v.optional(v.string()),
  addressLine1: v.optional(v.string()),
  addressLine2: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  conditions: v.optional(v.string()),
  priorSurgeries: v.optional(v.string()),
  familyHistory: v.optional(v.string()),
  hasNoAllergies: v.optional(v.boolean()),
  allergies: v.optional(v.array(allergyRowValidator)),
  takesNoMedications: v.optional(v.boolean()),
  medications: v.optional(v.array(medicationRowValidator)),
  consentTelehealth: v.optional(v.boolean()),
  consentPrivacy: v.optional(v.boolean()),
  consentTerms: v.optional(v.boolean()),
  consentAccuracy: v.optional(v.boolean()),
  currentSection: intakeSectionValidator,
  completedSections: v.array(intakeSectionValidator),
  intakeComplete: v.boolean(),
});

async function getPatientByAuthUserId(
  ctx: Parameters<typeof getAuthUserId>[0],
  authUserId: string,
): Promise<Doc<"patients"> | null> {
  return await ctx.db
    .query("patients")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
    .unique();
}

// Read the current patient/intake record for the signed-in user.
// Returns null when unauthenticated or when no intake has started yet.
export const getMyPatient = query({
  args: {},
  returns: v.union(patientReturnValidator, v.null()),
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;
    return await getPatientByAuthUserId(ctx, authUserId);
  },
});

// Merge newly-completed sections into the existing list, in order.
function mergeCompleted(
  existing: readonly Section[],
  section: Section,
): Section[] {
  const set = new Set<Section>(existing);
  set.add(section);
  return SECTION_ORDER.filter((s) => set.has(s));
}

function nextSection(section: Section): Section {
  const idx = SECTION_ORDER.indexOf(section);
  return SECTION_ORDER[Math.min(idx + 1, SECTION_ORDER.length - 1)];
}

// Personal section. This is the patient-record creation point: it upserts.
export const savePersonal = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    sex: v.string(),
    preferredLanguage: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthUserId(ctx);
    const existing = await getPatientByAuthUserId(ctx, authUserId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        completedSections: mergeCompleted(existing.completedSections, "personal"),
        currentSection: existing.intakeComplete
          ? existing.currentSection
          : nextSection("personal"),
      });
    } else {
      await ctx.db.insert("patients", {
        authUserId,
        ...args,
        currentSection: "contact",
        completedSections: ["personal"],
        intakeComplete: false,
      });
    }
    return null;
  },
});

export const saveContact = mutation({
  args: {
    phone: v.string(),
    addressLine1: v.string(),
    addressLine2: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthUserId(ctx);
    const existing = await getPatientByAuthUserId(ctx, authUserId);
    if (!existing) throw new Error("Start intake from the first step");
    await ctx.db.patch(existing._id, {
      ...args,
      completedSections: mergeCompleted(existing.completedSections, "contact"),
      currentSection: existing.intakeComplete
        ? existing.currentSection
        : nextSection("contact"),
    });
    return null;
  },
});

export const saveMedicalHistory = mutation({
  args: {
    conditions: v.string(),
    priorSurgeries: v.string(),
    familyHistory: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthUserId(ctx);
    const existing = await getPatientByAuthUserId(ctx, authUserId);
    if (!existing) throw new Error("Start intake from the first step");
    await ctx.db.patch(existing._id, {
      ...args,
      completedSections: mergeCompleted(
        existing.completedSections,
        "medical-history",
      ),
      currentSection: existing.intakeComplete
        ? existing.currentSection
        : nextSection("medical-history"),
    });
    return null;
  },
});

export const saveAllergies = mutation({
  args: {
    hasNoAllergies: v.boolean(),
    allergies: v.array(allergyRowValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthUserId(ctx);
    const existing = await getPatientByAuthUserId(ctx, authUserId);
    if (!existing) throw new Error("Start intake from the first step");
    await ctx.db.patch(existing._id, {
      hasNoAllergies: args.hasNoAllergies,
      allergies: args.hasNoAllergies ? [] : args.allergies,
      completedSections: mergeCompleted(existing.completedSections, "allergies"),
      currentSection: existing.intakeComplete
        ? existing.currentSection
        : nextSection("allergies"),
    });
    return null;
  },
});

export const saveMedications = mutation({
  args: {
    takesNoMedications: v.boolean(),
    medications: v.array(medicationRowValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthUserId(ctx);
    const existing = await getPatientByAuthUserId(ctx, authUserId);
    if (!existing) throw new Error("Start intake from the first step");
    await ctx.db.patch(existing._id, {
      takesNoMedications: args.takesNoMedications,
      medications: args.takesNoMedications ? [] : args.medications,
      completedSections: mergeCompleted(
        existing.completedSections,
        "medications",
      ),
      currentSection: existing.intakeComplete
        ? existing.currentSection
        : nextSection("medications"),
    });
    return null;
  },
});

// Consent is the final section. Completing it marks intake complete and
// creates the pre-payment order for the selected product. No payment step.
export const completeConsent = mutation({
  args: {
    productId: v.id("products"),
    consentTelehealth: v.boolean(),
    consentPrivacy: v.boolean(),
    consentTerms: v.boolean(),
    consentAccuracy: v.boolean(),
  },
  returns: v.object({ orderId: v.id("orders") }),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthUserId(ctx);
    const existing = await getPatientByAuthUserId(ctx, authUserId);
    if (!existing) throw new Error("Start intake from the first step");

    if (
      !args.consentTelehealth ||
      !args.consentPrivacy ||
      !args.consentTerms ||
      !args.consentAccuracy
    ) {
      throw new Error("All consents are required to place an order");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    await ctx.db.patch(existing._id, {
      consentTelehealth: args.consentTelehealth,
      consentPrivacy: args.consentPrivacy,
      consentTerms: args.consentTerms,
      consentAccuracy: args.consentAccuracy,
      completedSections: mergeCompleted(existing.completedSections, "consent"),
      currentSection: "consent",
      intakeComplete: true,
    });

    const orderId = await ctx.db.insert("orders", {
      authUserId,
      patientId: existing._id,
      productId: product._id,
      productName: product.name,
      productCondition: product.condition,
      priceCents: product.priceCents,
      status: "pending_review",
      payment: "unpaid",
    });

    return { orderId };
  },
});
