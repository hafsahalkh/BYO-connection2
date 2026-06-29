import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StepNavProps {
  onBack?: () => void;
  nextLabel: string;
  submitting?: boolean;
}

export function StepNav({ onBack, nextLabel, submitting }: StepNavProps) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-muted transition-colors hover:text-ink disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
      ) : (
        <span />
      )}
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Saving..." : nextLabel}
      </Button>
    </div>
  );
}
