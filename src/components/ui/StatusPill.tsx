import { CheckCircle2, Clock, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "intake_complete"
  | "order_placed"
  | "pending_review";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  intake_complete: {
    label: "Intake Complete",
    icon: CheckCircle2,
    // success-leaning, muted
    className: "bg-[#eaf2ec] text-[#2f6347] border-[#cfe2d5]",
  },
  order_placed: {
    label: "Order Placed",
    icon: Package,
    className: "bg-brand-tint text-brand-hover border-[#cfe0d8]",
  },
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    // warning-leaning, calm amber
    className: "bg-[#f7efdd] text-[#8a6014] border-[#e7d6ad]",
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
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
