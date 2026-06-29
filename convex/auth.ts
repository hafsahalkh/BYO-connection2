import { betterAuth } from "better-auth";
import { createClient, convexAdapter, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { emailOTP, twoFactor } from "better-auth/plugins";
import type { GenericDataModel } from "convex/server";
import { components, internal } from "./_generated/api";
import authConfig from "./auth.config";
import { sendEmail, type EmailLogEntry } from "./email";
import type { EmailTemplateKey } from "./emailTemplates";

export const authClient = createClient(components.betterAuth);

// Fallback URL for localhost development
const fallbackSiteUrl = process.env.SITE_URL ?? "http://localhost:5173";

// Check if an origin matches allowed patterns
function isAllowedOrigin(origin: string): boolean {
  // Localhost (any port)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  // WebContainers (dev environments)
  if (origin.endsWith(".local-corp.webcontainer-api.io")) {
    return true;
  }
  // E2B sandbox preview domains
  if (origin.endsWith(".e2b.app")) {
    return true;
  }
  // Convex static hosting deployments
  if (origin.endsWith(".convex.site")) {
    return true;
  }
  return false;
}

// Get the dynamic site URL from request origin (for crossDomain plugin)
function getDynamicSiteUrl(request?: Request): string {
  const requestOrigin = request?.headers.get("origin");

  if (requestOrigin && isAllowedOrigin(requestOrigin)) {
    return requestOrigin;
  }

  // Fall back to configured site URL
  return fallbackSiteUrl;
}

// Get trusted origins based on the incoming request
function getTrustedOrigins(request?: Request): string[] {
  const origins: string[] = [];

  // Always trust the configured site URL
  if (fallbackSiteUrl) {
    origins.push(fallbackSiteUrl);
  }

  // Explicit additional origins from env (for custom domains in prod)
  if (process.env.BETTER_AUTH_TRUSTED_ORIGINS) {
    const explicit = process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map(
      (o) => o.trim()
    );
    origins.push(...explicit);
  }

  // Dynamically trust the request origin if it matches allowed patterns
  const requestOrigin = request?.headers.get("origin");
  if (requestOrigin && isAllowedOrigin(requestOrigin)) {
    origins.push(requestOrigin);
  }

  return origins;
}

// OTP code lifetime surfaced in template copy. Better Auth's emailOTP plugin
// defaults to a 5-minute expiry.
const OTP_EXPIRES_MINUTES = 5;

export function createAuth(ctx: GenericCtx<GenericDataModel>, request?: Request) {
  // Use the request origin as siteUrl if it matches allowed patterns
  const siteUrl = getDynamicSiteUrl(request);

  // Persist non-sensitive send metadata to the emailLog table (AC5). The auth
  // handler dispatches OTP emails from a mutation/action context, so a
  // `runMutation` is available; we guard for the query-ctx type member of the
  // GenericCtx union (which can't write) and skip logging there.
  const recordLog = async (entry: EmailLogEntry) => {
    const runner = ctx as {
      runMutation?: (ref: typeof internal.emailLog.record, args: {
        messageId: string | null;
        to: string;
        template: string;
        status: EmailLogEntry["status"];
        tag: string;
        timestamp: number;
      }) => Promise<unknown>;
    };
    if (typeof runner.runMutation !== "function") return;
    try {
      await runner.runMutation(internal.emailLog.record, {
        messageId: entry.messageId,
        to: entry.to,
        template: entry.template,
        status: entry.status,
        tag: entry.tag,
        timestamp: entry.timestamp,
      });
    } catch (err) {
      // Logging is best-effort; never let it block delivery.
      console.error(
        "emailLog record failed:",
        err instanceof Error ? err.message : String(err),
      );
    }
  };

  return betterAuth({
    baseURL: process.env.CONVEX_SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: convexAdapter(ctx, components.betterAuth),
    trustedOrigins: getTrustedOrigins,
    session: {
      cookieCache: {
        enabled: false,
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
    },
    plugins: [
      emailOTP({
        // Dispatch a verification email automatically on signup so the
        // verification flow is testable end-to-end. Sign-in is NOT hard-gated
        // on verification (requireEmailVerification stays false below), which
        // keeps the seeded patient account and any new account able to sign in
        // immediately while still receiving and being able to act on the code.
        sendVerificationOnSignUp: true,
        otpLength: 6,
        expiresIn: OTP_EXPIRES_MINUTES * 60,
        async sendVerificationOTP({ email, otp, type }) {
          // Map Better Auth OTP types to in-codebase templates. Password reset
          // arrives as "forget-password"; signup verification as
          // "email-verification". "sign-in" reuses the verification template.
          const template: EmailTemplateKey =
            type === "forget-password"
              ? "auth-password-reset"
              : "auth-email-verification";

          // Route through the centralized sender, which renders the template,
          // attaches rate-limit metadata, sends via the managed relay, and
          // records non-sensitive metadata to emailLog.
          await sendEmail({
            to: email,
            template,
            data: { code: otp, expiresMinutes: OTP_EXPIRES_MINUTES },
            recordLog,
          });
        },
      }),
      twoFactor({
        issuer: process.env.VITE_PROJECT_NAME ?? "Specode App",
        skipVerificationOnEnable: false,
        totpOptions: { digits: 6, period: 30 },
        backupCodeOptions: { amount: 10, length: 8 },
      }),
      convex({ authConfig }),
      crossDomain({ siteUrl }),
    ],
  });
}
