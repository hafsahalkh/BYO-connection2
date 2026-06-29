import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Field, Textarea } from "@/components/ui/Field";
import { StepBody } from "../IntakeShell";
import { StepNav } from "../StepNav";

interface StepProps {
  patient: Doc<"patients"> | null;
  direction: "forward" | "back";
  onSaved: () => void;
  onBack: () => void;
}

export function MedicalHistoryStep({
  patient,
  direction,
  onSaved,
  onBack,
}: StepProps) {
  const save = useMutation(api.intake.saveMedicalHistory);
  const [conditions, setConditions] = useState(patient?.conditions ?? "");
  const [surgeries, setSurgeries] = useState(patient?.priorSurgeries ?? "");
  const [family, setFamily] = useState(patient?.familyHistory ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitting(true);
    await save({
      conditions: conditions.trim(),
      priorSurgeries: surgeries.trim(),
      familyHistory: family.trim(),
    });
    setSubmitting(false);
    onSaved();
  }

  return (
    <StepBody
      title="A little about your health"
      intro="Sharing your history helps your provider decide whether this therapy is right and safe for you. There are no wrong answers, and you can write as much or as little as you like."
      direction={direction}
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-5">
          <Field
            label="Current or past conditions"
            htmlFor="conditions"
            hint="For example: hypertension, thyroid conditions, diabetes. Write 'none' if that applies."
          >
            <Textarea
              id="conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="List any diagnosed conditions..."
            />
          </Field>
          <Field
            label="Prior surgeries or hospitalizations"
            htmlFor="surgeries"
            hint="Approximate dates are fine."
          >
            <Textarea
              id="surgeries"
              value={surgeries}
              onChange={(e) => setSurgeries(e.target.value)}
              placeholder="Anything notable in your surgical history..."
            />
          </Field>
          <Field
            label="Relevant family history (optional)"
            htmlFor="family"
            hint="Conditions that run in your immediate family."
          >
            <Textarea
              id="family"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              placeholder="Optional..."
            />
          </Field>
        </div>

        <StepNav nextLabel="Continue" submitting={submitting} onBack={onBack} />
      </form>
    </StepBody>
  );
}
