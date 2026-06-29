# Project Summary

- Source: project creation
- Captured At: 2026-06-29T20:03:07.137Z

## Initial Request

I want to build a D2C peptide marketplace where patients browse products, create accounts, complete intake questionnaires, and checkout. Providers review orders in the EMR, approve prescriptions, and send to our compound pharmacy for fulfillment. Patients can track everything (orders, status, shipment tracking) in-app.

## Product
D2C telehealth marketplace for peptide therapies. Landing-led; real prescription pipeline (browse, account, condition-specific intake, order, provider review, pharmacy fulfillment, status tracking). First build slice is patient-only: landing, catalog + product detail, auth + intake funnel, My Orders / Intake Status. Flow stops before payment in this slice.

## Visual Direction (drafted 2026-06-29, pending review)
- **Chosen direction**: warm-but-clinically-grounded. Aspirational/premium landing; quiet clinical clarity on auth/intake/orders.
- **Palette**: warm off-white paper base (#FAF8F4), deep botanical-green primary (#2F5D50), muted terracotta secondary (#C57B57). Warm-tinted neutrals, no pure black/white. Chosen specifically to avoid the medical-teal / supplement-bright category reflex.
- **Type**: humanist serif for landing display (Fraunces/Newsreader feel); humanist sans for all body/product/intake.
- **Layout**: editorial-spacious on marketing, balanced-compact on product. Density matched to surface.
- **Motion**: restrained, ease-out, no bounce.

## Intake Funnel Decisions (locked in brief)
- Standard funnel header, numbered step circles + labels (desktop) / progress bar (mobile).
- Grouped questions per section. Warm-and-reassuring tone with why-we-ask microcopy on allergies/medications.
- Resume Later as subtle header text link (signup-first, no guest mode). Slide-from-right transitions.

## Open / To Confirm
- Direction is pending user review. If it reads too warm or not clinical enough, that is the primary correction lever.
- No reference assets were provided.

## Durable Implementation Notes
- **Transactional email (Mailgun)**: Delivery runs through the Specode-managed Mailgun relay (mode `specode_managed`, provisioned internally). No user env setup (MAILGUN_API_KEY / MAILGUN_DOMAIN / MAILGUN_FROM / SPECODE_EMAIL_*) is needed to test in dev/staging. Custom Mailgun keys would only matter later for a bring-your-own sending domain.
- **Centralized email sender**: `convex/email.ts` is the single sender. Callers pass a template key + data (templates in `convex/emailTemplates.ts`), never raw HTML or relay calls. Every send writes metadata-only to the `emailLog` table (messageId/to/template/status/tag/timestamp — never body or codes).
- **Auth email flows live**: signup verification (`auth-email-verification`) and password reset (`auth-password-reset`) both route through the sender. Reset is OTP-code based via Better Auth `emailOTP` (Forgot password link on /login → /reset-password screen). Sign-in is NOT hard-gated on verification (`requireEmailVerification: false`), so seeded/new accounts can sign in immediately.
