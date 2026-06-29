# PeptideRx Design Brief

## Product Context
- **App type**: D2C telehealth marketplace for peptide therapies — a landing-led, conversion-oriented storefront fronting a real prescription pipeline (browse, account, condition-specific intake, order, provider review, pharmacy fulfillment, status tracking). This brief anchors the patient-only first build slice (landing, catalog + detail, auth + intake funnel, My Orders / Intake Status) and establishes the enduring visual system for all later surfaces.
- **Primary personas**: Patient (primary, the only role in this slice) — a health-conscious consumer evaluating peptide therapy from home, typically evening, on phone or laptop, deciding whether to trust an online service with their health information and a prescription. Downstream: provider, pharmacy, admin (not styled here, but the system must extend to dense console surfaces without a re-skin).
- **Primary jobs to be done**: Understand the offering and feel it is legitimate clinical care, not a supplement shop; browse and evaluate a specific peptide; create an account and complete a medical intake without anxiety about privacy; confirm an order was placed and track its status.

## Direction Summary
The chosen direction is a **warm-but-clinically-grounded** system: aspirational, premium polish on the public landing and catalog, dialed toward quiet clinical clarity the moment the patient crosses into auth, intake, and orders. The foundation is a warm off-white paper with tinted neutrals, anchored by a single deep botanical-green primary that reads as considered, modern medicine rather than the reflexive medical-teal or supplement-bright palettes. One muted terracotta secondary adds human warmth without undercutting credibility. This is deliberately not stark clinical white (cold, transactional) and not a dark "tech" theme (wrong mood for an at-home health decision). The landing earns trust through editorial generosity and real-feeling product presentation; intake earns trust through calm, private, one-section-at-a-time pacing with reassuring microcopy. This direction is the decision being approved — if it reads too warm or not clinical enough for your brand, that is the thing to correct at review.

## Brand and Mood
- **Brand personality**: Clinically credible, calm, premium, modern, honest. Real prescribing care presented with the polish of a consumer health brand.
- **Mood**: Reassuring and grounded. Confident without being loud; warm without being soft on safety.
- **Keywords**: trustworthy, calm, premium, clinical, warm, precise

## Color System
Defined in OKLCH, every neutral tinted toward the green primary hue (no pure black or white). Strategy: **Restrained** on product surfaces (tinted neutrals + one accent), with the **Committed** green carrying brand moments on the landing.
- **Backgrounds / neutrals**: Warm off-white paper (`#FAF8F4`) as the base; a slightly cooler surface (`#F4F1EB`, white-tinted panels) for cards and raised panels. Borders and dividers are low-contrast warm greys (`#E5E0D8` / `#D8D2C7`). Text is a near-black warm ink (`#1E2420`), never `#000`.
- **Primary accent**: Deep botanical green (`#2F5D50`) — the brand signal, used for primary CTAs, active states, links, and key brand moments. A deeper variant (`#234A40`) for hover/pressed, a tint (`#E8F0EC`) for selected/active backgrounds.
- **Secondary accents**: Muted terracotta (`#C57B57`) for warmth and occasional emphasis (badges, highlights, secondary illustration accents) — used sparingly, never competing with the green for primary actions. A soft sage tint (`#DCE6DF`) for subtle fills.
- **Semantic colors**: Success green-leaning but distinct from brand (`#3E7C5A`); warning amber (`#B8801F`); error a desaturated clinical red (`#C0473E`), never alarmist neon; info muted slate-blue (`#4A6B7A`). All semantic colors are muted to suit a calm clinical context.

## Typography Direction
- **Display / emphasis**: A humanist serif for landing hero and major section headlines (e.g. Fraunces, Source Serif, or Newsreader) — editorial and premium, signaling considered care over generic SaaS. Used only at large sizes on marketing surfaces; product UI does not use the serif for chrome.
- **Body / UI text**: A clean humanist sans (e.g. Inter, or a warmer alternative like Mulish/Hanken Grotesk) for all body copy, forms, labels, tables, and product UI. Carries the entire intake and orders experience for clarity and neutrality.
- **Hierarchy notes**: Scale ratio ≥1.25 between steps; clear weight contrast (regular body, semibold labels, the serif reserved for display). Body line length capped 65–75ch on landing long-form. Intake and orders stay sans-only for a calm, legible, EHR-grade read without coldness.

## Layout and Navigation
- **Layout direction**: Spacious and editorial on landing and catalog (generous whitespace, asymmetric rhythm, real product imagery, varied section structure — not an identical card grid). Balanced-to-compact on authenticated product surfaces (orders, intake) where clarity beats drama. Match density to the surface, not one global setting.
- **Navigation pattern**: Public top nav (logo, a few links, prominent "Get Started" CTA) on landing and catalog. Auth pages are viewport-centered with brand mark above the form, no app chrome. The intake funnel hides main navigation entirely and runs as a stand-alone funnel surface. My Orders is a simple authenticated patient view with a minimal top bar (logo, account) — no heavy sidebar in this slice.
- **Screen rhythm**: Landing alternates full-bleed and contained sections with varied spacing for rhythm. Catalog is a real, scannable product layout. Product detail leads with clear info and a single confident CTA into sign-up. Avoid wrapping everything in containers; let some sections breathe full-width.

## Component Style
- **Surfaces**: Soft, lightly elevated cards on warm surface tint, medium radius (`12px` default, `16px` for feature cards), subtle warm-toned shadows (low spread, never heavy). No nested cards. Glassmorphism not used.
- **Inputs and forms**: Comfortable, generous field height (`44px+`), clear labels above inputs, soft borders that deepen to green on focus, calm focus ring. Intake fields prioritize legibility and low anxiety — roomy spacing, no dense gridlock. Error states are quiet and instructive, never red-flashing.
- **Buttons and actions**: One clear primary (solid deep green, white text), one secondary (outline or low-tint), tertiary as text links. Single primary action per view. Medium radius matching cards. Confident but not glowing — no neon CTA treatment.
- **Data display**: My Orders renders order + intake status as clear status cards / list rows with a calm status pill system (e.g. Intake Complete, Order Placed, Pending Review) mapped to the muted semantic palette. Readable, real data, not a metrics-dashboard template.

## Intake Funnel Overlay (intake-specific decisions)
- **Funnel header**: Standard — logo + app name at comfortable size, generous breathing room above the form, no marketing tagline. Reads as a stand-alone trusted surface with main nav hidden.
- **Progress indicator**: Numbered step circles with section labels (Personal • Contact • Medical History • Allergies • Medications • Consent) on desktop, since there are fewer than ~6–7 sections; collapses to a thin progress bar on mobile.
- **Step rhythm**: Grouped questions per section — one screen per intake section (3–6 fields visible), not one-question-at-a-time. Keeps the flow guided but efficient and signals a finite, manageable length.
- **Tone for medical questions**: Warm-and-reassuring. Short microcopy explains why sensitive questions are asked (allergies, current medications), with soft, non-judgmental framing. Calm and private, reflecting the HIPAA-adjacent seriousness of ePHI without feeling like a cold EHR form.
- **Resume Later**: Subtle text link in the funnel header confirming progress is saved. (Signup-first, no guest mode in scope, so a confirmation modal on close is not load-bearing here.)
- **Mobile funnel header**: Sticky logo + thin progress bar; drops step labels but keeps logo for trust and progress for orientation.

## Motion and Feedback
- **Motion tone**: Restrained. Purposeful, calm, never decorative. Ease-out exponential curves; no bounce or elastic.
- **Interaction notes**: Landing uses gentle reveal-on-scroll and soft hover lifts on cards/CTAs. Intake transitions slide-from-right on Next, fade on Back, to carry forward momentum without feeling busy. Focus states are clear and accessible. Loading and status changes resolve quietly. Never animate layout properties.

## References
- No reference assets were provided by the user. Direction derived from product positioning (real prescribing telehealth, premium consumer health) and the patient trust journey.
- Cross-domain influences (for the implementer's mental model, not to copy): the editorial calm and premium type of considered consumer-health brands combined with grounded clinical clarity — explicitly avoiding supplement-store brightness and legacy-portal density.

## Anti-Patterns / Constraints
- No reflexive healthcare palette (blue-and-white stethoscope look, generic teal-and-white wellness template). The chosen green/terracotta exists specifically to avoid the category reflex.
- No legacy EHR aesthetic on intake — no dense grey tables, blue-bar headers, or cold matter-of-fact medical chrome.
- No supplement / wellness-bright look (loud gradients, glowing CTAs, hype color) that would undercut "real prescription" credibility.
- No generic SaaS slop: no identical card grids, no hero-metric template, no gradient text, no side-stripe accent borders, no glassmorphism, no modal-first patterns.
- No pure `#000`/`#fff`; all neutrals warm-tinted.
- Accessibility: WCAG AA contrast minimum on text and interactive elements; visible focus rings; semantic, muted status colors not relied on by color alone (pair with label/icon). Intake must remain low-anxiety and legible at body sizes.
- Auth pages must be viewport-centered with brand above the form, never flush to an edge.
- This brief is enduring visual direction only; it intentionally excludes build-slice planning, screen-by-screen task lists, and roadmap milestones.
