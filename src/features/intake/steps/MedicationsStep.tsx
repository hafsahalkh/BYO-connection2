import { useState } from "react";
import { useMutation } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/Field";
import { StepBody } from "../IntakeShell";
import { StepNav } from "../StepNav";

interface StepProps {
  patient: Doc<"patients"> | null;
  direction: "forward" | "back";
  onSaved: () => void;
  onBack: () => void;
}

interface MedRow {
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
}

const emptyRow: MedRow = { name: "", dosage: "", frequency: "", prescriber: "" };

export function MedicationsStep({
  patient,
  direction,
  onSaved,
  onBack,
}: StepProps) {
  const save = useMutation(api.intake.saveMedications);
  const [none, setNone] = useState(patient?.takesNoMedications ?? false);
  const [rows, setRows] = useState<MedRow[]>(
    patient?.medications && patient.medications.length > 0
      ? patient.medications
      : [{ ...emptyRow }],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateRow(i: number, patch: Partial<MedRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    const filled = rows.filter((r) => r.name.trim());
    if (!none && filled.length === 0) {
      setError("Add at least one medication, or check the box below.");
      return;
    }
    setSubmitting(true);
    await save({
      takesNoMedications: none,
      medications: none
        ? []
        : filled.map((r) => ({
            name: r.name.trim(),
            dosage: r.dosage.trim(),
            frequency: r.frequency.trim(),
            prescriber: r.prescriber.trim(),
          })),
    });
    setSubmitting(false);
    onSaved();
  }

  return (
    <StepBody
      title="What are you currently taking?"
      intro="Some peptides interact with other medications. Listing what you take, including supplements, helps your provider keep you safe."
      direction={direction}
    >
      <form onSubmit={onSubmit} noValidate>
        <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-border bg-surface px-4 py-3">
          <input
            type="checkbox"
            checked={none}
            onChange={(e) => setNone(e.target.checked)}
            className="h-4 w-4 accent-[#2f5d50]"
          />
          <span className="text-[15px] text-ink">
            I am not currently taking any medications
          </span>
        </label>

        {!none && (
          <div className="mt-6 space-y-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] sm:items-center"
              >
                <Input
                  aria-label="Medication name"
                  value={row.name}
                  onChange={(e) => updateRow(i, { name: e.target.value })}
                  placeholder="Name"
                />
                <Input
                  aria-label="Dosage"
                  value={row.dosage}
                  onChange={(e) => updateRow(i, { dosage: e.target.value })}
                  placeholder="Dosage"
                />
                <Input
                  aria-label="Frequency"
                  value={row.frequency}
                  onChange={(e) => updateRow(i, { frequency: e.target.value })}
                  placeholder="Frequency"
                />
                <Input
                  aria-label="Prescriber"
                  value={row.prescriber}
                  onChange={(e) => updateRow(i, { prescriber: e.target.value })}
                  placeholder="Prescriber"
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  aria-label="Remove medication"
                  className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-border text-muted transition-colors hover:border-error hover:text-error disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              <Plus size={16} /> Add another
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-[13px] font-medium text-error">{error}</p>
        )}

        <StepNav nextLabel="Continue" submitting={submitting} onBack={onBack} />
      </form>
    </StepBody>
  );
}
