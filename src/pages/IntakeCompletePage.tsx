import { useNavigate } from "react-router-dom";
import { CheckCircle2, Stethoscope } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function IntakeCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 py-4 sm:px-8">
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-brand">
          <CheckCircle2 size={32} />
        </span>
        <h1 className="mt-7 font-serif text-[clamp(1.9rem,1.5rem+1.6vw,2.6rem)] font-medium leading-tight tracking-tight text-ink">
          Your order is in for review
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Thank you for taking the time to share your history. Your intake has
          been saved and your order is now waiting for a licensed clinician to
          review.
        </p>

        <div className="mt-8 w-full rounded-[16px] border border-border bg-surface p-6 text-left">
          <div className="flex items-start gap-3">
            <Stethoscope size={20} className="mt-0.5 shrink-0 text-brand" />
            <div>
              <p className="text-[15px] font-semibold text-ink">
                What happens next
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                A provider will review your responses against the therapy you
                selected. You can follow your order status anytime from My
                Orders. You have not been charged.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate("/orders")}>
            View my orders
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/catalog")}
          >
            Browse more
          </Button>
        </div>
      </main>
    </div>
  );
}
