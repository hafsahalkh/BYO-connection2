// Transactional email templates (AC1/AC2). Every email body the app sends is
// rendered here from a named template + typed data, so callers never build HTML
// inline. Templates use the PeptideRx warm-clinical palette for brand
// consistency with the in-app experience.
//
// NOTE: this module currently covers only the auth verification / reset codes
// that the auth layer dispatches. Order / approval / shipment templates belong
// to the later transactional-email iteration and are intentionally not added
// here yet.

export type EmailTemplateData = {
  "auth-email-verification": { code: string; expiresMinutes: number };
  "auth-password-reset": { code: string; expiresMinutes: number };
};

export type EmailTemplateKey = keyof EmailTemplateData;

// Brand tokens mirrored from the design system for email-safe inline styles.
const INK = "#1E2420";
const MUTED = "#5C6560";
const BRAND = "#2F5D50";
const SURFACE = "#F4F1EB";
const PAPER = "#FAF8F4";
const BORDER = "#E5E0D8";

function shell(title: string, intro: string, code: string, expiresMinutes: number): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: ${PAPER}; padding: 32px 16px;">
      <div style="max-width: 460px; margin: 0 auto; background: #FFFFFF; border: 1px solid ${BORDER}; border-radius: 16px; padding: 32px;">
        <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND};">PeptideRx</p>
        <h1 style="margin: 0 0 12px; font-size: 22px; color: ${INK};">${title}</h1>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: ${MUTED};">${intro}</p>
        <div style="display: inline-block; font-size: 28px; letter-spacing: 8px; font-weight: 700; color: ${INK}; padding: 14px 20px; border-radius: 12px; background: ${SURFACE};">
          ${code}
        </div>
        <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.6; color: ${MUTED};">
          This code expires in ${expiresMinutes} minutes. If you didn't request it, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}

export function renderTemplate<K extends EmailTemplateKey>(
  template: K,
  data: EmailTemplateData[K],
): { subject: string; html: string } {
  switch (template) {
    case "auth-email-verification":
      return {
        subject: "Verify your email",
        html: shell(
          "Verify your email",
          "Enter this code to confirm your email and continue with your care.",
          data.code,
          data.expiresMinutes,
        ),
      };
    case "auth-password-reset":
      return {
        subject: "Reset your password",
        html: shell(
          "Reset your password",
          "Use this code to reset your PeptideRx password.",
          data.code,
          data.expiresMinutes,
        ),
      };
    default: {
      // Exhaustiveness guard.
      const _never: never = template;
      throw new Error(`Unknown email template: ${String(_never)}`);
    }
  }
}
