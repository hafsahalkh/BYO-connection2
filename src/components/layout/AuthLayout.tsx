import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link to="/" aria-label="PeptideRx home">
              <Logo size="md" />
            </Link>
            <h1 className="mt-7 font-serif text-3xl font-medium tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {subtitle}
            </p>
          </div>

          <div className="rounded-[16px] border border-border bg-surface p-7 shadow-card">
            {children}
          </div>

          <div className="mt-6 text-center text-[14px] text-muted">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
