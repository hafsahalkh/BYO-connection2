import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useAction } from "convex/react";
import {
  Package,
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  X,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatPrice } from "@/lib/utils";

type Banner = {
  tone: "success" | "info" | "warning";
  title: string;
  body: string;
};

function bannerForParam(param: string | null): Banner | null {
  switch (param) {
    case "success":
      return {
        tone: "success",
        title: "Payment authorized",
        body: "Your card is on hold and your order is now in clinical review. You will only be charged if a licensed clinician approves your prescription.",
      };
    case "cancel":
      return {
        tone: "info",
        title: "Checkout canceled",
        body: "No payment was taken. Your order is saved — you can complete payment any time to send it for review.",
      };
    case "unavailable":
      return {
        tone: "warning",
        title: "Payment couldn't start",
        body: "Your order is saved. Payment is temporarily unavailable — please try completing it again in a moment.",
      };
    default:
      return null;
  }
}

export function OrdersPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const orders = useQuery(api.orders.listMine);
  const patient = useQuery(api.intake.getMyPatient);
  const startCheckout = useAction(api.billing.checkout.startCheckout);
  const [resumingId, setResumingId] = useState<string | null>(null);

  const firstName = patient?.firstName;
  const banner = bannerForParam(params.get("checkout"));

  function dismissBanner() {
    const next = new URLSearchParams(params);
    next.delete("checkout");
    next.delete("order");
    setParams(next, { replace: true });
  }

  async function resumePayment(orderId: string) {
    setResumingId(orderId);
    try {
      const { url } = await startCheckout({
        orderId: orderId as Id<"orders">,
        origin: window.location.origin,
      });
      window.location.assign(url);
    } catch {
      setResumingId(null);
      const next = new URLSearchParams(params);
      next.set("checkout", "unavailable");
      setParams(next, { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <AppBar />

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 md:py-16">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            Your account
          </p>
          <h1 className="font-serif text-[clamp(2rem,1.6rem+1.6vw,2.7rem)] font-medium leading-tight tracking-tight text-ink">
            {firstName ? `Welcome, ${firstName}` : "My orders"}
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">
            Track your intake, payment, and where each order sits in clinical
            review.
          </p>
        </div>

        {banner && (
          <CheckoutBanner banner={banner} onDismiss={dismissBanner} />
        )}

        <div className="mt-10">
          {orders === undefined ? (
            <OrdersSkeleton />
          ) : orders.length === 0 ? (
            <EmptyState onBrowse={() => navigate("/catalog")} />
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => {
                const needsPayment =
                  order.payment === "unpaid" || order.payment === "failed";
                return (
                  <li
                    key={order._id}
                    className="rounded-[16px] border border-border bg-surface p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand">
                          <Package size={20} />
                        </span>
                        <div>
                          <h2 className="text-lg font-semibold text-ink">
                            {order.productName}
                          </h2>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                            <Stethoscope size={13} className="text-brand" />
                            {order.productCondition}
                          </p>
                          <p className="mt-2 text-[13px] text-muted">
                            Placed{" "}
                            {new Date(order._creationTime).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <StatusPill
                          status={order.status}
                          payment={order.payment}
                        />
                        <span className="text-[15px] font-semibold text-ink">
                          {formatPrice(order.priceCents)}
                        </span>
                      </div>
                    </div>

                    <OrderNote payment={order.payment} />

                    {needsPayment && (
                      <div className="mt-4">
                        <Button
                          onClick={() => resumePayment(order._id)}
                          disabled={resumingId === order._id}
                        >
                          <CreditCard size={16} />
                          {resumingId === order._id
                            ? "Opening checkout…"
                            : "Complete payment"}
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderNote({ payment }: { payment: string }) {
  if (payment === "unpaid") {
    return (
      <div className="mt-5 flex items-start gap-2.5 rounded-[12px] border border-border bg-paper px-4 py-3 text-[13px] leading-relaxed text-muted">
        <CreditCard size={16} className="mt-0.5 shrink-0 text-brand" />
        Add a payment method to reserve this order. Your card is authorized,
        not charged — a clinician reviews your intake before any charge.
      </div>
    );
  }
  if (payment === "failed") {
    return (
      <div className="mt-5 flex items-start gap-2.5 rounded-[12px] border border-[#e3c4c0] bg-[#fbf3f2] px-4 py-3 text-[13px] leading-relaxed text-[#9a3d36]">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        We couldn't authorize your payment. Please try completing payment again
        to send this order for review.
      </div>
    );
  }
  // authorized / captured
  return (
    <div className="mt-5 flex items-start gap-2.5 rounded-[12px] border border-border bg-paper px-4 py-3 text-[13px] leading-relaxed text-muted">
      <ClipboardList size={16} className="mt-0.5 shrink-0 text-brand" />
      Payment authorized. A licensed clinician will review your responses before
      your prescription is approved — your card is only charged on approval.
    </div>
  );
}

function CheckoutBanner({
  banner,
  onDismiss,
}: {
  banner: Banner;
  onDismiss: () => void;
}) {
  const tone = {
    success: "border-[#cfe2d5] bg-[#eaf2ec] text-[#2f6347]",
    info: "border-[#d4dde2] bg-[#eef1f3] text-[#3c5560]",
    warning: "border-[#e7d6ad] bg-[#f7efdd] text-[#8a6014]",
  }[banner.tone];
  const Icon = banner.tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`mt-8 flex items-start gap-3 rounded-[14px] border px-5 py-4 ${tone}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-[15px] font-semibold">{banner.title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed opacity-90">
          {banner.body}
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-[16px] border border-border bg-surface"
        />
      ))}
    </div>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="rounded-[16px] border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand">
        <Package size={26} />
      </span>
      <h2 className="mt-5 font-serif text-2xl font-medium text-ink">
        No orders yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
        Choose a peptide and complete a short intake. Your order will appear
        here for clinical review.
      </p>
      <div className="mt-7">
        <Button size="lg" onClick={onBrowse}>
          Browse the catalog
        </Button>
      </div>
    </div>
  );
}
