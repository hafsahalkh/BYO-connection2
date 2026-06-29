import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full min-h-[44px] rounded-[10px] border border-border-strong bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus-ring";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(controlBase, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlBase, "min-h-[96px] resize-y leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(controlBase, "appearance-none bg-no-repeat pr-9", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C6560' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
      backgroundPosition: "right 0.75rem center",
    }}
    {...props}
  />
));
Select.displayName = "Select";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-ink"
      >
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </label>
      {hint && <p className="text-[13px] leading-relaxed text-muted">{hint}</p>}
      {children}
      {error && (
        <p className="text-[13px] font-medium text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
