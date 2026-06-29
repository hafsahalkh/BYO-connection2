"use node";

import Stripe from "stripe";

// App-owned Stripe access layer. ALL Stripe SDK calls live behind this module
// so the rest of the app never imports `stripe` directly. Keep checkout,
// capture, and void here.
//
// Payment model: authorize-at-checkout, capture-on-approval.
// Checkout is created with manual capture, so completing checkout places an
// AUTHORIZATION HOLD on the patient's card rather than charging it. The hold is
// later captured (on provider approval) or voided (on provider denial). That
// provider-console UI does not exist yet — `captureAuthorization` and
// `voidAuthorization` below are built and ready for the provider-review
// iteration, where the provider's approve/deny action will trigger them.
//
// NOTE: Stripe authorization holds expire automatically after ~7 days. The
// provider-review SLA in the provider-console iteration must respect this
// window: an order not captured within ~7 days will have its hold released by
// Stripe and must be re-authorized.

// Throws a clear, non-crashing error when Stripe is not yet configured. This
// lets the app build and run in preview before the keys are added in
// Project Settings; the checkout action surfaces this message to the user.
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Payments are not available yet. STRIPE_SECRET_KEY is not configured for this project.",
    );
  }
  return new Stripe(secretKey, {
    // Pin a recent API version for stable behavior across deploys.
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

type CreateCheckoutParams = {
  orderId: string;
  productName: string;
  productCondition: string;
  amountCents: number;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
};

// Create a Checkout Session that AUTHORIZES (manual capture) payment for one
// order. Returns the session id + hosted checkout URL to redirect the patient.
export async function createAuthorizationCheckout(
  params: CreateCheckoutParams,
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.customerEmail,
    // Manual capture => completing checkout places an authorization hold
    // instead of charging immediately.
    payment_intent_data: {
      capture_method: "manual",
      metadata: { orderId: params.orderId },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: params.amountCents,
          product_data: {
            name: params.productName,
            description: `Clinical review for ${params.productCondition}`,
          },
        },
      },
    ],
    // Carried through to the webhook so it can resolve the order idempotently.
    metadata: { orderId: params.orderId },
    client_reference_id: params.orderId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }
  return { sessionId: session.id, url: session.url };
}

// Capture a previously-authorized PaymentIntent. Wired for the provider-console
// iteration: called when a provider APPROVES a prescription.
export async function captureAuthorization(
  paymentIntentId: string,
): Promise<void> {
  const stripe = getStripeClient();
  await stripe.paymentIntents.capture(paymentIntentId);
}

// Release (void) an authorization hold without charging. Wired for the
// provider-console iteration: called when a provider DENIES a prescription.
export async function voidAuthorization(
  paymentIntentId: string,
): Promise<void> {
  const stripe = getStripeClient();
  await stripe.paymentIntents.cancel(paymentIntentId);
}
