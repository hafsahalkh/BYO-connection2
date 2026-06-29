# PeptideRx - D2C Peptide Marketplace with In-App Provider Review and Pharmacy Fulfillment

## Overall Vision
A direct-to-consumer telehealth marketplace for peptide therapies. Patients browse a catalog, create an account, complete a condition-specific intake questionnaire, and place an order. A licensed provider reviews each order in an in-app review console and approves or denies the prescription. Approved prescriptions flow to an in-app compound pharmacy fulfillment queue, and patients track order/prescription status plus shipment progress from their account. The product is fully self-contained: provider review and pharmacy fulfillment happen inside the app, with no external EMR or external pharmacy system in scope.

## Personas
- **Patient (primary)**: A consumer seeking peptide therapy. Browses products, signs up, completes intake, places an order, and tracks status and shipment. Wants a clear, trustworthy path from interest to delivery.
- **Provider / Prescriber**: A licensed clinician who reviews each order's intake responses in an in-app approval queue, then approves or denies the prescription. Needs an efficient queue and the patient's intake context to make a decision.
- **Pharmacy / Fulfillment**: Staff at the compound pharmacy who work an in-app queue of approved prescriptions, mark them as compounded/shipped, and attach tracking. Needs a clean worklist and status controls.
- **Admin / Operations**: Manages the product catalog, users, and roles, and oversees the end-to-end pipeline. Needs catalog and user management plus visibility into the order lifecycle.

## User Flows
- **Patient order flow (primary)**: Land on marketing page → browse peptide catalog → select a product → create account (shared sign-in) → complete the product/condition-specific intake questionnaire (eligibility-gating) → place the order → (provider review happens) → see prescription approved or denied → track order/prescription status and shipment in-app.
- **Provider review flow**: Sign in (role-routed) → open the approval queue → open an order, read the patient's intake responses and product details → approve or deny the prescription with a reason → approved orders move into the fulfillment queue.
- **Pharmacy fulfillment flow**: Sign in (role-routed) → open the fulfillment queue of approved prescriptions → mark as compounded, then shipped, attaching shipment/tracking info → patient sees updated status and tracking.
- **Admin / operations flow**: Sign in (role-routed) → manage the product catalog (add/edit peptides) → manage users and roles → monitor orders moving through review and fulfillment.

### Roles and access model
- One shared sign-in with role-based routing (patient, provider, pharmacy/fulfillment, admin/operations). No separate auth pages per role unless the user later requests it.
- Single-tenant topology: one organization operating the marketplace, one provider pool and one pharmacy queue. Patients are organization-scoped (global within this single operating org). Not multi-clinic or multi-tenant.

## First Build Slice (Build Now)
### Goal
A landing-page-led slice that locks the visual identity and proves the core patient entry path — browse, sign up, start intake, and see a real "my orders / intake status" view — with zero third-party integrations. The intake/order flow stops before any payment step (no Stripe in this slice), and a real authenticated patient screen renders the patient's actual data.

### Roles in First Build
- Patient only. Provider, pharmacy, and admin roles are deferred to later iterations.

### Screens in First Build (3-4 screens, landing page is the design anchor)
1. **Landing / marketing home** — public front door explaining the offering with a clear "Browse / Get Started" CTA. This is the design-system anchor styled with full depth.
2. **Catalog + product detail** — browse the peptide catalog and view a product, leading into sign-up. (Treated as the browse surface that feeds the CTA; kept simple and real.)
3. **Auth (sign-up + sign-in) + intake questionnaire** — shared sign-up for the patient role, then the product/condition-specific intake funnel. The flow ends at order placement without charging — it stops before the Stripe step rather than stubbing a fake payment screen.
4. **Patient "My Orders / Intake Status" screen** — the first authenticated patient view, rendering the patient's actual order and intake-completion data (real data they just produced), not a stub.

### First Build Rules
- Landing page is the highest-priority screen and anchors the visual identity for every later iteration.
- One primary role only (patient). No provider/pharmacy/admin surfaces in this slice.
- Zero third-party integrations: no Stripe, no email, no audit logging, no MFA. Auth (the role gate) is the only mechanic allowed.
- The order/intake flow stops before payment. No mock Stripe UI — the step is removed, not faked.
- The first authenticated screen shows real patient data (their order + intake status), not a placeholder dashboard.
- Target: roughly an engineer-day, with the landing page carrying the bulk of the design effort.

## MVP Scope (P0)
The coherent product the marketplace is incoherent without — broader than the first slice. Includes the integrations and roles the end-to-end prescription pipeline requires.

- **Patient order lifecycle, end-to-end**: browse → account → intake → order → review outcome → fulfillment → status + shipment tracking.
- **Per-product / condition-specific intake questionnaires** that gate eligibility *(assumption — see Assumptions)*. Intake sections: Personal Details, Contact Information, Medical History, Allergies, Current Medications, and Consent & Agreements (US field conventions, signup-first, required before placing an order). Insurance and Lifestyle sections are excluded unless requested.
- **In-app provider review console** with an approval queue: read intake context, approve/deny prescriptions with a reason.
- **In-app pharmacy fulfillment queue**: work approved prescriptions, mark compounded/shipped, attach tracking.
- **Patient status + shipment tracking** in-app (order/prescription status and shipment tracking). No lab results.
- **Four roles** via one shared role-routed sign-in: patient, provider, pharmacy/fulfillment, admin/operations.
- **Admin / operations**: product catalog management and user/role management.
- **Payments (Stripe)** with authorize-at-checkout, capture-on-approval *(assumption — see Assumptions)*: the patient's card is authorized at checkout but not charged until a provider approves; the authorization is released/voided if denied.
- **Transactional email**: account verification/password reset, order placed, prescription approved/denied, and shipment notifications. Specode-managed delivery in early builds; bring-your-own sender domain noted for the production-readiness iteration.
- **Protected, role-gated access** for all non-patient surfaces, with account recovery (password reset) for signed-in users.

### HIPAA / ePHI posture (policy, not build mechanics)
- This product handles ePHI (intake responses, prescriptions, order/medical context), so HIPAA expectations apply. Compliance hardening is tracked here as posture, not as build tasks in the slices.
- **Audit logging** of access to PHI surfaces (patient records, intake, prescriptions, orders) is part of the P0 pipeline's hardening. Default reviewer role: admin/operations (super-admin equivalent). Self-access tagged but hidden by default in the viewer. Retention default 6 years; a retention cron is a known gap to revisit. Auth events stay in the auth tables for v1.
- **MFA** on the protected non-patient roles (provider, pharmacy, admin/operations) — TOTP with backup codes, required on enrollment for those roles. Patients are not required to enroll. Seeded role logins ship MFA-off so enrollment can be completed in-browser.

## Build Later
### Soon After MVP
- Bring-your-own Mailgun sender domain (branded, production sender identity; BAA-covered email path for any PHI-bearing messages).
- Provider notifications (new order awaiting review, queue alerts) and pharmacy queue alerts via email.
- Admin-driven MFA reset for locked-out staff accounts.
- Audit-log retention cron and an audit-log viewer surface in the admin shell.

### Later Improvements
- Reorder / subscription refills for ongoing peptide therapy.
- Richer patient dashboard (order history, messaging with provider).
- Reporting/analytics for operations on pipeline throughput and approval rates.
- Folding auth events into the consolidated audit trail once a compliance officer role exists.

## Deferred Integrations
- **Stripe** — deferred out of the first build slice; added in a later iteration as the single integration for that slice (authorize-at-checkout, capture-on-approval).
- **Transactional email (Mailgun)** — deferred out of the first build slice; added one iteration at a time after payments.
- (No external EMR or external pharmacy-system integration is in scope — provider review and pharmacy fulfillment are entirely in-app.)

## Assumptions (please correct any that are wrong)
- **Payment timing: authorize-at-checkout, capture-on-approval.** The patient is not charged until a provider approves the prescription; the authorization is released/voided on denial. Chosen as the safer model for a prescription gate.
- **Roles: patient + provider + pharmacy/fulfillment + admin/operations**, behind one shared sign-in with role-based routing (no separate auth pages per role).
- **Intake: per-product / condition-specific questionnaires that gate eligibility**, since peptides have differing contraindications. Intake is required before placing an order, signup-first (no guest mode), US field conventions.
- **Topology: single operating organization** (not multi-clinic / multi-tenant); patients are scoped to the one operating org.

## What's Been Implemented
- [x] Landing / marketing home (design anchor) — public hero, value props, catalog teaser, footer
- [x] Peptide catalog + product detail (browse surface) — 6 seeded peptides, real Convex-backed listing and detail pages
- [x] Patient auth (sign-up + sign-in) — shared Better Auth email/password flow; seeded patient example login verified
- [x] Product/condition-specific intake questionnaire — 6-section funnel (personal, contact, medical history, allergies, medications, consent) with resume/progress tracking; completing consent creates a pre-payment order and stops before any payment step
- [x] Patient "My Orders / Intake Status" authenticated screen — renders the patient's real orders and intake status via Convex queries
- [x] Transactional email — auth flows only: centralized sender (`convex/email.ts`) + in-codebase templates (`convex/emailTemplates.ts`), `emailLog` metadata table, signup email verification + password-reset (Forgot password on /login → /reset-password). Sends via the Specode-managed Mailgun relay (no user env setup). Order/approval/shipment emails remain deferred.
- [x] Payments (Stripe) — authorize-at-checkout via Stripe Checkout (manual capture). Intake completion hands the patient into Stripe Checkout to place an authorization hold; the order stays in `pending_review` with a separate `payment` state (`unpaid` → `authorized`). App-owned billing helpers in `convex/billing/*` (checkout action, `captureAuthorization`/`voidAuthorization`, plus an idempotent webhook at `/api/stripe/webhook`). Capture/void are built and ready for the provider-console iteration (no UI triggers them yet). Graceful no-key behavior so the app still builds/runs before Stripe is configured. My Orders reflects payment/authorization state via the status-pill system and lets unpaid/failed orders resume payment. Requires STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET in Project Settings; checkout must be tested on the deployed URL (Stripe does not load in the preview pane).

> Patient slice + auth email + payments complete. Checkout must be tested on the deployed URL (Stripe does not load in the preview pane).

> Update this section as features are built. Check items off as they become real.

## Next Steps
- **Iteration 3 — Provider review console**: in-app approval queue, intake context view, approve/deny with reason; approved orders flow forward. Triggers prescription-decision state. On approval, call the existing `captureAuthorization` billing helper; on denial, call `voidAuthorization`. The review SLA must respect the ~7-day Stripe authorization-hold expiry (re-authorize if it lapses).
- **Iteration 4 — Pharmacy fulfillment queue**: in-app worklist for approved prescriptions, compounded/shipped status, tracking attachment; patient status + shipment tracking wired up.
- **Iteration 5 — Admin / operations**: catalog management and user/role management in an admin shell.
- **Iteration 6 — Transactional email (Mailgun)**: auth verification + password reset are DONE (centralized sender, templates, emailLog, managed relay). Remaining: order-placed, approval/denial, and shipment notifications — add as new templates through the existing sender.
- **Iteration 7 — Compliance hardening**: PHI audit logging and MFA for provider/pharmacy/admin roles.
