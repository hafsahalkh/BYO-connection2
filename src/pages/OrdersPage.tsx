import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { Package, Stethoscope, ClipboardList } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatPrice } from "@/lib/utils";

export function OrdersPage() {
  const navigate = useNavigate();
  const orders = useQuery(api.orders.listMine);
  const patient = useQuery(api.intake.getMyPatient);

  const firstName = patient?.firstName;

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
            Track your intake and where each order sits in clinical review.
          </p>
        </div>

        <div className="mt-10">
          {orders === undefined ? (
            <OrdersSkeleton />
          ) : orders.length === 0 ? (
            <EmptyState onBrowse={() => navigate("/catalog")} />
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
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
                      <StatusPill status={order.status} />
                      <span className="text-[15px] font-semibold text-ink">
                        {formatPrice(order.priceCents)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-[12px] border border-border bg-paper px-4 py-3 text-[13px] leading-relaxed text-muted">
                    <ClipboardList
                      size={16}
                      className="mt-0.5 shrink-0 text-brand"
                    />
                    Intake complete. A licensed clinician will review your
                    responses before your prescription is approved. You have not
                    been charged.
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
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
