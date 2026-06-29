import { useState } from "react";
import { useMutation } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Input, Select } from "@/components/ui/Field";
import { StepBody } from "../IntakeShell";
import { StepNav } from "../StepNav";

interface StepProps {
  patient: Doc<"patients"> | null;
  direction: "forward" | "back";
  onSaved: () => void;
  onBack: () => void;
}

type AllergyType = "medication" | "food" | "environmental" | "other";
type Severity = "mild" | "moderate" | "severe";

interface AllergyRow {
  type: AllergyType;
  detail: string;
  severity: Severity;
}

const emptyRow: AllergyRow = { type: "medication", detail: "", severity: "mild" };

export function AllergiesStep({ patient, direction, onSaved, onBack }: StepProps) {
  const save = useMutation(api.intake.saveAllergies);
  const [none, setNone] = useState(patient?.hasNoAllergies ?? false);
  const [rows, setRows] = useState<AllergyRow[]>(
    patient?.allergies && patient.allergies.length > 0
      ? patient.allergies
      : [{ ...emptyRow }],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateRow(i: number, patch: Partial<AllergyRow>) {
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
    const filled = rows.filter((r) => r.detail.trim());
    if (!none && filled.length === 0) {
      setError(
        "Add at least one allergy, or check the box if you have none.",
      );
      return;
    }
    setSubmitting(true);
    await save({
      hasNoAllergies: none,
      allergies: none ? [] : filled.map((r) => ({ ...r, detail: r.detail.trim() })),
    });
    setSubmitting(false);
    onSaved();
  }

  return (
    <StepBody
      title="Any allergies we should know about?"
      intro="Allergies can change what is safe to prescribe. Even minor reactions are worth noting here. Nothing here is judged, it only keeps you safe."
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
            I have no known allergies
          </span>
        </label>

        {!none && (
          <div className="mt-6 space-y-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1.4fr_1fr_auto] sm:items-center"
              >
                <Select
                  aria-label="Allergy type"
                  value={row.type}
                  onChange={(e) =>
                    updateRow(i, { type: e.target.value as AllergyType })
                  }
                >
                  <option value="medication">Medication</option>
                  <option value="food">Food</option>
                  <option value="environmental">Environmental</option>
                  <option value="other">Other</option>
                </Select>
                <Input
                  aria-label="Allergy detail"
                  value={row.detail}
                  onChange={(e) => updateRow(i, { detail: e.target.value })}
                  placeholder="e.g. Penicillin"
                />
                <Select
                  aria-label="Severity"
                  value={row.severity}
                  onChange={(e) =>
                    updateRow(i, { severity: e.target.value as Severity })
                  }
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </Select>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  aria-label="Remove allergy"
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
