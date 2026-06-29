import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Clinician-reviewed peptide therapy, delivered with the care of a
              real medical practice.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { label: "Catalog", to: "/catalog" },
                { label: "How it works", to: "/#how-it-works" },
                { label: "Safety", to: "/#safety" },
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                { label: "Sign in", to: "/login" },
                { label: "Get started", to: "/catalog" },
                { label: "My orders", to: "/orders" },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { label: "About", to: "/#how-it-works" },
                { label: "Privacy", to: "/#safety" },
                { label: "Terms", to: "/#safety" },
              ]}
            />
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-[13px] leading-relaxed text-muted">
          <p>
            PeptideRx is a demonstration telehealth marketplace. It does not
            provide real medical advice, prescriptions, or treatment.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} PeptideRx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold uppercase tracking-wider text-ink">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-[15px] text-muted transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
