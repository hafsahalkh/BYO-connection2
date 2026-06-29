import { useState } from "react";
import { useMutation } from "convex/react";
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
  const complete = useMutation(api.intake.completeConsent);
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
      onComplete(result.orderId);
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
          You will not be charged today. Placing your order submits it for a
          licensed clinician to review.
        </div>

        {error && (
          <p className="mt-4 text-[13px] font-medium text-error">{error}</p>
        )}

        <StepNav
          nextLabel="Place order for review"
          submitting={submitting}
          onBack={onBack}
        />
      </form>
    </StepBody>
  );
}
