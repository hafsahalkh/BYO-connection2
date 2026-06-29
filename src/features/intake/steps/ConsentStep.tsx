import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { StepBody } from "../IntakeShell";
import { StepNav } from "../StepNav";

interface StepProps {
  patient: Doc<"patients"> | null;
  productId: Id<"products">;
  productName: string;
  direction: "forward" | "back";
  onComplete: (orderId: string) => void;
  onBack: () => void;
}

const CONSENTS = [
  {
    key: "consentTelehealth" as const,
    label: "Telehealth consent",
    body: "I consent to receive care through telehealth, including provider review of my intake without an in-person visit.",
  },
  {
    key: "consentPrivacy" as const,
    label: "Privacy practices",
    body: "I have reviewed how my health information is collected and used to provide my care.",
  },
  {
    key: "consentTerms" as const,
    label: "Terms of service",
    body: "I agree to the terms of service governing my use of PeptideRx.",
  },
  {
    key: "consentAccuracy" as const,
    label: "Accuracy of information",
    body: "The information I have provided is accurate to the best of my knowledge.",
  },
];

export function ConsentStep({
  patient,
  productId,
  productName,
  direction,
  onComplete,
  onBack,
}: StepProps) {
  const navigate = useNavigate();
  const complete = useMutation(api.intake.completeConsent);
  const startCheckout = useAction(api.billing.checkout.startCheckout);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    consentTelehealth: patient?.consentTelehealth ?? false,
    consentPrivacy: patient?.consentPrivacy ?? false,
    consentTerms: patient?.consentTerms ?? false,
    consentAccuracy: patient?.consentAccuracy ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allChecked = CONSENTS.every((c) => checked[c.key]);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!allChecked) {
      setError("Each agreement is required before placing your order.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await complete({
        productId,
        consentTelehealth: checked.consentTelehealth,
        consentPrivacy: checked.consentPrivacy,
        consentTerms: checked.consentTerms,
        consentAccuracy: checked.consentAccuracy,
      });
      // Let the parent clear funnel session state (product slug).
      onComplete(result.orderId);

      // Authorize-at-checkout: hand the patient to Stripe Checkout to place an
      // authorization hold (no charge until a provider approves later).
      try {
        const { url } = await startCheckout({
          orderId: result.orderId as Id<"orders">,
          origin: window.location.origin,
        });
        window.location.assign(url);
        return;
      } catch {
        // Payments not configured yet, or checkout could not start. The order
        // already exists (pending review, unpaid) so it is recoverable from
        // My Orders, where the patient can resume payment.
        navigate(`/orders?checkout=unavailable&order=${result.orderId}`, {
          replace: true,
        });
        return;
      }
    } catch {
      setSubmitting(false);
      setError("Something went wrong placing your order. Please try again.");
    }
  }

  return (
    <StepBody
      title="A few agreements before you finish"
      intro={`These confirm you understand how your care and information are handled. Each is required to place your order for ${productName}.`}
      direction={direction}
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-3">
          {CONSENTS.map((c) => (
            <label
              key={c.key}
              className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-border bg-surface px-4 py-4 transition-colors hover:border-border-strong"
            >
              <input
                type="checkbox"
                checked={checked[c.key]}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [c.key]: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f5d50]"
              />
              <span>
                <span className="block text-[15px] font-semibold text-ink">
                  {c.label}
                </span>
                <span className="mt-1 block text-[14px] leading-relaxed text-muted">
                  {c.body}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6 rounded-[12px] border border-border bg-brand-tint px-4 py-3 text-[13px] leading-relaxed text-brand-hover">
          Next you'll add a payment method to reserve your order. Your card is
          only authorized now — you are not charged unless a licensed clinician
          approves your prescription.
        </div>

        {error && (
          <p className="mt-4 text-[13px] font-medium text-error">{error}</p>
        )}

        <StepNav
          nextLabel="Continue to payment"
          submitting={submitting}
          onBack={onBack}
        />
      </form>
    </StepBody>
  );
}
