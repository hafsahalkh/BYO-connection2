import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { ArrowLeft, Check, ShieldCheck, Stethoscope } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const product = useQuery(
    api.products.getBySlug,
    slug ? { slug } : "skip",
  );

  function startIntake() {
    if (!product) return;
    const target = `/intake?product=${product.slug}`;
    if (user) {
      navigate(target);
    } else {
      navigate(`/signup?next=${encodeURIComponent(target)}`);
    }
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-paper">
        <PublicNav />
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="h-96 animate-pulse rounded-[20px] border border-border bg-surface" />
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-paper">
        <PublicNav />
        <div className="mx-auto max-w-3xl px-5 py-28 text-center sm:px-8">
          <h1 className="font-serif text-3xl font-medium text-ink">
            We could not find that product.
          </h1>
          <p className="mt-3 text-muted">
            It may have been removed from the catalog.
          </p>
          <div className="mt-7">
            <Button onClick={() => navigate("/catalog")}>
              Back to catalog
            </Button>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-16">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to catalog
        </Link>

        <div className="mt-8 grid gap-12 md:grid-cols-[0.95fr_1.05fr]">
          {/* Visual */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-[360px] w-full object-cover md:h-[440px]"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-[12px] border border-border bg-surface px-4 py-3 text-[13px] text-muted">
              <ShieldCheck size={18} className="shrink-0 text-brand" />
              Dispensed only after a licensed clinician reviews your intake.
            </div>
          </div>

          {/* Info */}
          <div>
            <span className="inline-block rounded-full border border-border-strong bg-surface px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-brand">
              {product.category}
            </span>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted">
              {product.shortName}
            </p>
            <h1 className="mt-1.5 font-serif text-[clamp(2.2rem,1.6rem+2vw,3rem)] font-medium leading-tight tracking-tight text-ink">
              {product.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {product.description}
            </p>

            <div className="mt-8 rounded-[16px] border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink">
                What patients explore it for
              </h2>
              <ul className="mt-4 space-y-3">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-[16px] border border-border bg-paper p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-semibold text-ink">
                  {formatPrice(product.priceCents)}
                  <span className="text-base font-normal text-muted">
                    {" "}
                    {product.priceCadence}
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                  <Stethoscope size={14} className="text-brand" />
                  Targets {product.condition.toLowerCase()}
                </p>
              </div>
              <Button size="lg" onClick={startIntake} className="sm:w-auto">
                Start intake
              </Button>
            </div>
            <p className="mt-3 text-center text-[13px] text-muted sm:text-left">
              You will create an account and complete a private intake. No
              charge today, your order is placed for clinician review.
            </p>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
