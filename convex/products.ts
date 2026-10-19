import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const productReturnValidator = v.object({
  _id: v.id("products"),
  _creationTime: v.number(),
  slug: v.string(),
  name: v.string(),
  shortName: v.string(),
  category: v.string(),
  tagline: v.string(),
  description: v.string(),
  benefits: v.array(v.string()),
  condition: v.string(),
  priceCents: v.number(),
  priceCadence: v.string(),
  imageUrl: v.string(),
  active: v.boolean(),
  sortOrder: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(productReturnValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(productReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

const seedProducts = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    shortName: "Body Protection Compound",
    category: "Recovery & Repair",
    tagline: "Targeted tissue repair for joints, tendons, and gut lining.",
    description:
      "BPC-157 is a synthetic peptide studied for its role in accelerating soft-tissue recovery. Patients exploring it are typically managing a stubborn injury or chronic gut discomfort and want a structured, clinician-reviewed path rather than an unregulated supplement.",
    benefits: [
      "Supports tendon and ligament recovery",
      "Studied for gut-lining and digestive comfort",
      "Often paired with a physical therapy routine",
    ],
    condition: "Soft-tissue recovery",
    priceCents: 18900,
    priceCadence: "per month",
    imageUrl:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=80",
    active: true,
    sortOrder: 1,
  },
  {
    slug: "tb-500",
    name: "TB-500",
    shortName: "Thymosin Beta-4",
    category: "Recovery & Repair",
    tagline: "Systemic recovery support for active, high-load lifestyles.",
    description:
      "TB-500 is a synthetic fragment of thymosin beta-4 explored for whole-body recovery and flexibility. It is most relevant for patients with recurring strains who want recovery support that reaches beyond a single injury site.",
    benefits: [
      "Studied for systemic recovery and mobility",
      "May support flexibility across multiple sites",
      "Commonly considered alongside BPC-157",
    ],
    condition: "Systemic recovery",
    priceCents: 21900,
    priceCadence: "per month",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",
    active: true,
    sortOrder: 2,
  },
  {
    slug: "cjc-1295-ipamorelin",
    name: "CJC-1295 / Ipamorelin",
    shortName: "GH Secretagogue Blend",
    category: "Vitality & Sleep",
    tagline: "A measured growth-hormone support blend for sleep and vitality.",
    description:
      "This combination peptide is studied for supporting the body's own growth-hormone rhythm. Patients tend to be focused on sleep quality, recovery, and age-related vitality, and want a monitored protocol rather than guesswork.",
    benefits: [
      "Studied for deeper, more restorative sleep",
      "Supports lean recovery and vitality",
      "Designed for a gentle, pulsatile release profile",
    ],
    condition: "Vitality and sleep",
    priceCents: 24900,
    priceCadence: "per month",
    imageUrl:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&q=80",
    active: true,
    sortOrder: 3,
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    shortName: "Selective GH Secretagogue",
    category: "Vitality & Sleep",
    tagline: "A selective option for patients new to GH-support peptides.",
    description:
      "Ipamorelin is a selective growth-hormone secretagogue often chosen as a gentler entry point. It suits patients who want vitality and recovery support with a cleaner, more targeted profile.",
    benefits: [
      "Selective, well-tolerated profile",
      "Supports recovery and sleep quality",
      "A common first step into GH-support peptides",
    ],
    condition: "Vitality and sleep",
    priceCents: 19900,
    priceCadence: "per month",
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
    active: true,
    sortOrder: 4,
  },
  {
    slug: "semaglutide",
    name: "Semaglutide",
    shortName: "GLP-1 Receptor Agonist",
    category: "Metabolic Health",
    tagline: "Clinician-guided metabolic support for weight management.",
    description:
      "Semaglutide is a GLP-1 receptor agonist studied for appetite regulation and metabolic health. Because dosing and contraindications matter here, this product is the clearest example of why a condition-specific intake review comes first.",
    benefits: [
      "Supports appetite regulation",
      "Studied for sustained metabolic health",
      "Always paired with clinician review of your history",
    ],
    condition: "Metabolic health",
    priceCents: 29900,
    priceCadence: "per month",
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80",
    active: true,
    sortOrder: 5,
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    shortName: "Copper Peptide",
    category: "Skin & Longevity",
    tagline: "A copper peptide studied for skin renewal and resilience.",
    description:
      "GHK-Cu is a naturally occurring copper peptide explored for skin firmness, repair, and longevity. It appeals to patients focused on visible skin quality who prefer an evidence-minded, reviewed approach.",
    benefits: [
      "Studied for skin firmness and renewal",
      "Supports collagen-related processes",
      "A longevity-minded, topical-adjacent option",
    ],
    condition: "Skin and longevity",
    priceCents: 16900,
    priceCadence: "per month",
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=80",
    active: true,
    sortOrder: 6,
  },
];

// Idempotent catalog seed. Safe to re-run; existing slugs are patched.
export const seedCatalog = internalMutation({
  args: {},
  returns: v.object({ inserted: v.number(), updated: v.number() }),
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;
    for (const product of seedProducts) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", product.slug))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, product);
        updated += 1;
      } else {
        await ctx.db.insert("products", product);
        inserted += 1;
      }
    }
    return { inserted, updated };
  },
});
