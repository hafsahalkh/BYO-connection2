// Declarative intake step configuration. The funnel wrapper is step-agnostic:
// adding a section is a new entry here plus a page component, nothing more.

export type IntakeSectionId =
  | "personal"
  | "contact"
  | "medical-history"
  | "allergies"
  | "medications"
  | "consent";

export interface IntakeStep {
  id: IntakeSectionId;
  label: string;
  path: string;
  // Short heading shown on the step screen.
  title: string;
  // Reassuring subheading explaining the section.
  intro: string;
}

export const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "personal",
    label: "Personal",
    path: "personal",
    title: "Let's start with the basics",
    intro:
      "Your provider needs to know who they are caring for. This stays private to your care team.",
  },
  {
    id: "contact",
    label: "Contact",
    path: "contact",
    title: "How we reach you",
    intro:
      "We use this to confirm your order and to ship to the right place. US addresses only for now.",
  },
  {
    id: "medical-history",
    label: "Medical History",
    path: "medical-history",
    title: "A little about your health",
    intro:
      "Sharing your history helps your provider decide whether this therapy is right and safe for you.",
  },
  {
    id: "allergies",
    label: "Allergies",
    path: "allergies",
    title: "Any allergies we should know about?",
    intro:
      "Allergies can change what is safe to prescribe. Even minor reactions are worth noting here.",
  },
  {
    id: "medications",
    label: "Medications",
    path: "medications",
    title: "What are you currently taking?",
    intro:
      "Some peptides interact with other medications. Listing what you take helps your provider keep you safe.",
  },
  {
    id: "consent",
    label: "Consent",
    path: "consent",
    title: "A few agreements before you finish",
    intro:
      "These confirm you understand how your care and information are handled. Each is required.",
  },
];

export const INTAKE_BASE = "/intake";

export function stepIndex(id: IntakeSectionId): number {
  return INTAKE_STEPS.findIndex((s) => s.id === id);
}

export function stepByPath(path: string): IntakeStep | undefined {
  return INTAKE_STEPS.find((s) => s.path === path);
}
