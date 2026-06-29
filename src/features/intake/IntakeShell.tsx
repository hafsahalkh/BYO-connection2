import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authClient } from "@/lib/auth-client";
import { IntakeProgress } from "./IntakeProgress";
import type { IntakeSectionId } from "./config";

interface IntakeShellProps {
  current: IntakeSectionId;
  children: ReactNode;
}

// Stand-alone funnel surface. Main app nav is intentionally hidden.
export function IntakeShell({ current, children }: IntakeShellProps) {
  const navigate = useNavigate();

  async function logout() {
    await authClient.signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Funnel header */}
      <header className="border-b border-border bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-[13px] font-medium text-success sm:flex">
              <Check size={14} /> Progress saved
            </span>
            <button
              onClick={logout}
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              Resume later
            </button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-5 sm:px-8">
          <IntakeProgress current={current} />
        </div>
      </div>

      {/* Step content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8 md:py-14">
        {children}
      </main>
    </div>
  );
}

interface StepBodyProps {
  title: string;
  intro: string;
  direction: "forward" | "back";
  children: ReactNode;
}

export function StepBody({ title, intro, direction, children }: StepBodyProps) {
  return (
    <div
      key={title}
      className={direction === "back" ? "step-enter-back" : "step-enter"}
    >
      <h1 className="font-serif text-[clamp(1.75rem,1.4rem+1.4vw,2.3rem)] font-medium leading-tight tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{intro}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
