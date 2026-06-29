import { Check } from "lucide-react";
import { INTAKE_STEPS, stepIndex, type IntakeSectionId } from "./config";
import { cn } from "@/lib/utils";

interface IntakeProgressProps {
  current: IntakeSectionId;
}

// Numbered step circles with labels on desktop; thin progress bar on mobile.
export function IntakeProgress({ current }: IntakeProgressProps) {
  const currentIdx = stepIndex(current);
  const total = INTAKE_STEPS.length;
  const pct = Math.round(((currentIdx + 1) / total) * 100);

  return (
    <div className="w-full">
      {/* Desktop: step circles */}
      <ol className="hidden items-center justify-between gap-2 md:flex">
        {INTAKE_STEPS.map((step, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors",
                    isDone &&
                      "border-brand bg-brand text-white",
                    isCurrent &&
                      "border-brand bg-brand-tint text-brand",
                    !isDone &&
                      !isCurrent &&
                      "border-border-strong bg-white text-muted",
                  )}
                >
                  {isDone ? <Check size={15} strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[13px] font-medium transition-colors",
                    isCurrent ? "text-ink" : "text-muted",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < total - 1 && (
                <span
                  className={cn(
                    "h-px flex-1",
                    isDone ? "bg-brand" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: thin progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-[13px] font-medium text-muted">
          <span className="text-ink">
            {INTAKE_STEPS[currentIdx]?.label}
          </span>
          <span>
            Step {currentIdx + 1} of {total}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
