import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { formatPrice } from "@/lib/utils";

export function CatalogPage() {
  const products = useQuery(api.products.list);

  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            The catalog
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-[clamp(2.2rem,1.6rem+2.4vw,3.2rem)] font-medium leading-tight tracking-tight text-ink">
            A focused set of well-studied peptides.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Choose what interests you, then complete a condition-specific intake.
            A clinician reviews every order before anything is dispensed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        {products === undefined ? (
          <CatalogSkeleton />
        ) : products.length === 0 ? (
          <p className="text-muted">The catalog is being prepared.</p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/catalog/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-[16px] border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[12px] font-semibold text-brand backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">
                    {product.shortName}
                  </p>
                  <h2 className="mt-1.5 text-xl font-semibold text-ink">
                    {product.name}
                  </h2>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
                    {product.tagline}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-[15px] font-semibold text-ink">
                      {formatPrice(product.priceCents)}
                      <span className="font-normal text-muted">
                        {" "}
                        {product.priceCadence}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-brand">
                      View
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-[16px] border border-border bg-surface"
        />
      ))}
    </div>
  );
}
