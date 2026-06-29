import {
  CheckCircle2,
  Package,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "intake_complete"
  | "order_placed"
  | "pending_review";

export type PaymentStatus =
  | "unpaid"
  | "authorized"
  | "captured"
  | "voided"
  | "failed";

// The pill reflects a single, patient-legible state derived from the clinical
// status + the payment/authorization state. Payment is tracked separately on
// the order; here we collapse the two into one calm status the patient reads.
type DisplayKey =
  | "awaiting_payment"
  | "payment_failed"
  | "in_review"
  | "intake_complete"
  | "order_placed";

const STATUS_CONFIG: Record<
  DisplayKey,
  { label: string; icon: LucideIcon; className: string }
> = {
  awaiting_payment: {
    label: "Awaiting Payment",
    icon: CreditCard,
    // neutral/info-leaning, calm
    className: "bg-[#eef1f3] text-[#3c5560] border-[#d4dde2]",
  },
  payment_failed: {
    label: "Payment Issue",
    icon: AlertCircle,
    // desaturated clinical red, never alarmist
    className: "bg-[#f6e7e5] text-[#9a3d36] border-[#e3c4c0]",
  },
  in_review: {
    label: "In Clinical Review",
    icon: ShieldCheck,
    // warning-leaning, calm amber — payment authorized, awaiting provider
    className: "bg-[#f7efdd] text-[#8a6014] border-[#e7d6ad]",
  },
  intake_complete: {
    label: "Intake Complete",
    icon: CheckCircle2,
    className: "bg-[#eaf2ec] text-[#2f6347] border-[#cfe2d5]",
  },
  order_placed: {
    label: "Order Placed",
    icon: Package,
    className: "bg-brand-tint text-brand-hover border-[#cfe0d8]",
  },
};

function resolveDisplay(
  status: OrderStatus,
  payment: PaymentStatus | undefined,
): DisplayKey {
  // Payment dimension takes precedence for the patient's next action.
  if (payment === "failed") return "payment_failed";
  if (payment === "unpaid") return "awaiting_payment";
  if (payment === "authorized" || payment === "captured") {
    // Hold placed (or captured) and order is sitting in clinical review.
    if (status === "pending_review") return "in_review";
  }
  if (status === "intake_complete") return "intake_complete";
  if (status === "order_placed") return "order_placed";
  // Fallback: pending review without a known payment state.
  return "in_review";
}

export function StatusPill({
  status,
  payment,
  className,
}: {
  status: OrderStatus;
  payment?: PaymentStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[resolveDisplay(status, payment)];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold",
        config.className,
        className,
      )}
    >
      <Icon size={14} aria-hidden="true" />
      {config.label}
    </span>
  );
}
