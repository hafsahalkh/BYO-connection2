import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ClipboardList,
  Stethoscope,
  Truck,
  Leaf,
  Lock,
} from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/lib/use-reveal";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Share your history",
    body: "Complete a condition-specific intake. Calm, private, one section at a time, with clear reasons for every question.",
  },
  {
    icon: Stethoscope,
    title: "A clinician reviews",
    body: "A licensed provider reviews your intake against the peptide you chose before anything is prescribed. No bots, no shortcuts.",
  },
  {
    icon: Truck,
    title: "Compounded and shipped",
    body: "Approved therapies are compounded at our partner pharmacy and shipped to your door, with status you can follow in-app.",
  },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Prescribed, not sold",
    body: "Every order is gated behind a real clinician review. We are a medical practice first and a storefront second.",
  },
  {
    icon: Leaf,
    title: "Considered formulations",
    body: "A focused catalog of well-studied peptides for recovery, vitality, metabolic health, and skin, not an endless supplement wall.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "Your medical information is collected with the seriousness it deserves and used only to review your care.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const reveal = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-paper" ref={reveal}>
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
              Clinician-reviewed peptide therapy
            </span>
            <h1 className="mt-6 font-serif text-[clamp(2.6rem,1.8rem+3.5vw,4rem)] font-medium leading-[1.05] tracking-tight text-ink">
              Modern medicine,
              <br />
              <span className="text-brand">delivered with care.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              PeptideRx pairs a curated catalog of well-studied peptides with a
              real clinical review for every order. Browse, share your history,
              and let a licensed provider decide what is right for you.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate("/catalog")}>
                Get started
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                How it works
              </Button>
            </div>
            <p className="mt-5 text-[13px] text-muted">
              No charge today. You only place an order after a clinician review.
            </p>
          </div>

          <div className="reveal relative">
            <div className="relative overflow-hidden rounded-[20px] border border-border bg-surface shadow-raised">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1100&q=80"
                alt="A clinician reviewing patient information at a calm, modern desk"
                className="h-[420px] w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden max-w-[230px] rounded-[16px] border border-border bg-paper p-4 shadow-card sm:block">
              <div className="flex items-center gap-2 text-brand">
                <Stethoscope size={18} />
                <span className="text-sm font-semibold text-ink">
                  Provider reviewed
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                A licensed clinician signs off on every prescription before it
                ships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-5 py-6 text-[14px] font-medium text-muted sm:px-8">
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand" /> Licensed providers
          </span>
          <span className="flex items-center gap-2">
            <Leaf size={16} className="text-brand" /> Compounded to order
          </span>
          <span className="flex items-center gap-2">
            <Lock size={16} className="text-brand" /> Private intake
          </span>
          <span className="flex items-center gap-2">
            <Truck size={16} className="text-brand" /> Tracked to your door
          </span>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div className="reveal max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            How it works
          </p>
          <h2 className="mt-3 font-serif text-[clamp(2rem,1.5rem+2vw,2.9rem)] font-medium leading-tight tracking-tight text-ink">
            A real clinical path, start to finish.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            This is not a checkout that hands you a vial. Three steps stand
            between interest and therapy, and a clinician owns the middle one.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="reveal flex flex-col rounded-[16px] border border-border bg-surface p-7 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-brand-tint text-brand">
                    <Icon size={22} />
                  </span>
                  <span className="font-serif text-3xl font-medium text-border-strong">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial split — safety */}
      <section id="safety" className="bg-brand text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <div className="reveal order-2 overflow-hidden rounded-[20px] border border-white/10 shadow-raised md:order-1">
            <img
              src="https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1100&q=80"
              alt="A pharmacist carefully preparing a compounded medication"
              className="h-[400px] w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="reveal order-1 md:order-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#d8b5a3]">
              Safety first
            </p>
            <h2 className="mt-3 font-serif text-[clamp(2rem,1.5rem+2vw,2.9rem)] font-medium leading-tight tracking-tight">
              Peptides are powerful. We treat them that way.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              Different peptides carry different contraindications, so we ask
              about your history before anything is prescribed. The intake is
              calm and unhurried, and nothing is dispensed until a provider has
              read it.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Condition-specific intake for every product",
                "Provider review on every single order",
                "Compounded by a licensed partner pharmacy",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-[#dbe7df]"
                  />
                  <span className="text-[15px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <Button
                size="lg"
                onClick={() => navigate("/catalog")}
                className="bg-white text-brand hover:bg-[#f0ece4]"
              >
                Browse the catalog
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="reveal">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-brand-tint text-brand">
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-ink">
                  {pillar.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                  {pillar.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="reveal overflow-hidden rounded-[24px] border border-border bg-surface px-7 py-14 text-center shadow-card sm:px-16">
          <h2 className="mx-auto max-w-2xl font-serif text-[clamp(1.9rem,1.5rem+2vw,2.8rem)] font-medium leading-tight tracking-tight text-ink">
            Ready to see what a clinician would recommend?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Browse the catalog, create your account, and complete a private
            intake. You will not be charged until your order is reviewed.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/catalog")}>
              Get started
            </Button>
            <Link
              to="/login"
              className="text-[15px] font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
