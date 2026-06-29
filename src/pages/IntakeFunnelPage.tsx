import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  INTAKE_STEPS,
  stepByPath,
  stepIndex,
  type IntakeSectionId,
} from "@/features/intake/config";
import { IntakeShell } from "@/features/intake/IntakeShell";
import { PersonalStep } from "@/features/intake/steps/PersonalStep";
import { ContactStep } from "@/features/intake/steps/ContactStep";
import { MedicalHistoryStep } from "@/features/intake/steps/MedicalHistoryStep";
import { AllergiesStep } from "@/features/intake/steps/AllergiesStep";
import { MedicationsStep } from "@/features/intake/steps/MedicationsStep";
import { ConsentStep } from "@/features/intake/steps/ConsentStep";

const PRODUCT_KEY = "peptiderx.intake.product";

export function IntakeFunnelPage() {
  const navigate = useNavigate();
  const { step } = useParams<{ step?: string }>();
  const [params] = useSearchParams();

  const patient = useQuery(api.intake.getMyPatient);

  // Resolve the chosen product. Persist the slug so it survives a refresh
  // even after the query param is dropped on later steps.
  const slugFromUrl = params.get("product");
  const [productSlug] = useState<string | null>(() => {
    if (slugFromUrl) {
      try {
        sessionStorage.setItem(PRODUCT_KEY, slugFromUrl);
      } catch {
        /* ignore */
      }
      return slugFromUrl;
    }
    try {
      return sessionStorage.getItem(PRODUCT_KEY);
    } catch {
      return null;
    }
  });

  const product = useQuery(
    api.products.getBySlug,
    productSlug ? { slug: productSlug } : "skip",
  );

  // Track navigation direction for transition styling.
  const prevIdxRef = useRef<number>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const activeStep = step ? stepByPath(step) : undefined;

  // Resume routing: if no/invalid step in URL, or the user jumped ahead of
  // their saved progress, redirect to their current section.
  useEffect(() => {
    if (patient === undefined) return; // still loading

    const suffix = productSlug ? `?product=${productSlug}` : "";
    const resumeId: IntakeSectionId = patient?.currentSection ?? "personal";

    if (!activeStep) {
      navigate(`/intake/${idToPath(resumeId)}${suffix}`, { replace: true });
      return;
    }

    // Prevent skipping ahead of saved progress (allow current + any completed).
    const targetIdx = stepIndex(activeStep.id);
    const allowedIdx = stepIndex(resumeId);
    const completed = new Set(patient?.completedSections ?? []);
    if (targetIdx > allowedIdx && !completed.has(activeStep.id)) {
      navigate(`/intake/${idToPath(resumeId)}${suffix}`, { replace: true });
    }
  }, [patient, activeStep, productSlug, navigate]);

  // Compute transition direction when the step changes.
  useEffect(() => {
    if (!activeStep) return;
    const idx = stepIndex(activeStep.id);
    setDirection(idx >= prevIdxRef.current ? "forward" : "back");
    prevIdxRef.current = idx;
  }, [activeStep]);

  if (patient === undefined || product === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    );
  }

  // No product context. Send the patient to the catalog to choose one.
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <h1 className="font-serif text-2xl font-medium text-ink">
          Choose a peptide to begin your intake
        </h1>
        <p className="max-w-sm text-[15px] text-muted">
          Your intake is tailored to the therapy you select.
        </p>
        <button
          onClick={() => navigate("/catalog")}
          className="rounded-[10px] bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-hover"
        >
          Browse the catalog
        </button>
      </div>
    );
  }

  if (!activeStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    );
  }

  const idx = stepIndex(activeStep.id);
  const suffix = productSlug ? `?product=${productSlug}` : "";

  function goToStep(targetIdx: number) {
    const target = INTAKE_STEPS[targetIdx];
    navigate(`/intake/${target.path}${suffix}`);
  }
  const onSaved = () => goToStep(idx + 1);
  const onBack = () => goToStep(idx - 1);

  return (
    <IntakeShell current={activeStep.id}>
      {activeStep.id === "personal" && (
        <PersonalStep
          patient={patient}
          direction={direction}
          onSaved={onSaved}
        />
      )}
      {activeStep.id === "contact" && (
        <ContactStep
          patient={patient}
          direction={direction}
          onSaved={onSaved}
          onBack={onBack}
        />
      )}
      {activeStep.id === "medical-history" && (
        <MedicalHistoryStep
          patient={patient}
          direction={direction}
          onSaved={onSaved}
          onBack={onBack}
        />
      )}
      {activeStep.id === "allergies" && (
        <AllergiesStep
          patient={patient}
          direction={direction}
          onSaved={onSaved}
          onBack={onBack}
        />
      )}
      {activeStep.id === "medications" && (
        <MedicationsStep
          patient={patient}
          direction={direction}
          onSaved={onSaved}
          onBack={onBack}
        />
      )}
      {activeStep.id === "consent" && (
        <ConsentStep
          patient={patient}
          productId={product._id}
          productName={product.name}
          direction={direction}
          onBack={onBack}
          onComplete={() => {
            try {
              sessionStorage.removeItem(PRODUCT_KEY);
            } catch {
              /* ignore */
            }
          }}
        />
      )}
    </IntakeShell>
  );
}

function idToPath(id: IntakeSectionId): string {
  return INTAKE_STEPS.find((s) => s.id === id)?.path ?? "personal";
}
