import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Field, Input, Select } from "@/components/ui/Field";
import { StepBody } from "../IntakeShell";
import { StepNav } from "../StepNav";

interface StepProps {
  patient: Doc<"patients"> | null;
  direction: "forward" | "back";
  onSaved: () => void;
}

export function PersonalStep({ patient, direction, onSaved }: StepProps) {
  const save = useMutation(api.intake.savePersonal);
  const [firstName, setFirstName] = useState(patient?.firstName ?? "");
  const [lastName, setLastName] = useState(patient?.lastName ?? "");
  const [dob, setDob] = useState(patient?.dateOfBirth ?? "");
  const [sex, setSex] = useState(patient?.sex ?? "");
  const [language, setLanguage] = useState(
    patient?.preferredLanguage ?? "English",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    if (!dob) e.dob = "Date of birth is required.";
    if (!sex) e.sex = "Please select an option.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await save({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dob,
      sex,
      preferredLanguage: language,
    });
    setSubmitting(false);
    onSaved();
  }

  return (
    <StepBody
      title="Let's start with the basics"
      intro="Your provider needs to know who they are caring for. This stays private to your care team."
      direction={direction}
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" required error={errors.firstName}>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Last name" htmlFor="lastName" required error={errors.lastName}>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="dob" required error={errors.dob}>
            <Input
              id="dob"
              type="date"
              value={dob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field>
          <Field label="Sex assigned at birth" htmlFor="sex" required error={errors.sex}>
            <Select id="sex" value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="intersex">Intersex</option>
              <option value="prefer-not">Prefer not to say</option>
            </Select>
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Preferred language" htmlFor="language">
            <Select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>Mandarin</option>
              <option>French</option>
              <option>Other</option>
            </Select>
          </Field>
        </div>

        <StepNav nextLabel="Continue" submitting={submitting} />
      </form>
    </StepBody>
  );
}
