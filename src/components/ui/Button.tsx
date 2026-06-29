import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-colors duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover border border-transparent",
  secondary:
    "bg-transparent text-brand border border-border-strong hover:bg-brand-tint hover:border-brand",
  ghost: "bg-transparent text-ink hover:bg-surface border border-transparent",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
