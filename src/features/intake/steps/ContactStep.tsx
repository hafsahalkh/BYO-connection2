import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Field, Input, Select } from "@/components/ui/Field";
import { StepBody } from "../IntakeShell";
import { StepNav } from "../StepNav";
import { US_STATES } from "../us-states";

interface StepProps {
  patient: Doc<"patients"> | null;
  direction: "forward" | "back";
  onSaved: () => void;
  onBack: () => void;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function ContactStep({ patient, direction, onSaved, onBack }: StepProps) {
  const save = useMutation(api.intake.saveContact);
  const [phone, setPhone] = useState(patient?.phone ?? "");
  const [line1, setLine1] = useState(patient?.addressLine1 ?? "");
  const [line2, setLine2] = useState(patient?.addressLine2 ?? "");
  const [city, setCity] = useState(patient?.city ?? "");
  const [state, setState] = useState(patient?.state ?? "");
  const [zip, setZip] = useState(patient?.postalCode ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (phone.replace(/\D/g, "").length !== 10)
      e.phone = "Enter a 10-digit US phone number.";
    if (!line1.trim()) e.line1 = "Street address is required.";
    if (!city.trim()) e.city = "City is required.";
    if (!state) e.state = "Select a state.";
    if (!/^\d{5}(-\d{4})?$/.test(zip.trim()))
      e.zip = "Enter a 5-digit ZIP code.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await save({
      phone: phone.trim(),
      addressLine1: line1.trim(),
      addressLine2: line2.trim(),
      city: city.trim(),
      state,
      postalCode: zip.trim(),
    });
    setSubmitting(false);
    onSaved();
  }

  return (
    <StepBody
      title="How we reach you"
      intro="We use this to confirm your order and to ship to the right place. US addresses only for now."
      direction={direction}
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-5">
          <Field label="Phone" htmlFor="phone" required error={errors.phone}>
            <Input
              id="phone"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />
          </Field>
          <Field label="Street address" htmlFor="line1" required error={errors.line1}>
            <Input
              id="line1"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              autoComplete="address-line1"
            />
          </Field>
          <Field label="Apt, suite, unit (optional)" htmlFor="line2">
            <Input
              id="line2"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              autoComplete="address-line2"
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-[1.4fr_1fr_1fr]">
          <Field label="City" htmlFor="city" required error={errors.city}>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
            />
          </Field>
          <Field label="State" htmlFor="state" required error={errors.state}>
            <Select id="state" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Select</option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ZIP code" htmlFor="zip" required error={errors.zip}>
            <Input
              id="zip"
              inputMode="numeric"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              autoComplete="postal-code"
              maxLength={10}
            />
          </Field>
        </div>

        <StepNav nextLabel="Continue" submitting={submitting} onBack={onBack} />
      </form>
    </StepBody>
  );
}
