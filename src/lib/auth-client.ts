import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { crossDomainClient } from "@/lib/cross-domain-client";

// Derive the Convex site URL from the cloud URL
// e.g., https://abc-123.convex.cloud -> https://abc-123.convex.site
// For local deployments, use VITE_CONVEX_SITE_URL directly (set in .env.local)
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const convexSiteUrl = (import.meta.env.VITE_CONVEX_SITE_URL as string) || convexUrl?.replace(".convex.cloud", ".convex.site");

export const authClient = createAuthClient({
  baseURL: convexSiteUrl,
  plugins: [
    convexClient(),
    crossDomainClient(),
    emailOTPClient(),
    twoFactorClient(),
  ],
  fetchOptions: {
    onSuccess: (ctx) => {
      // Prevent better-auth's default redirect plugin from navigating.
      // The cross-domain server plugin always injects a callbackURL for sign-in
      // (even when the client doesn't send one), resolving it against SITE_URL
      // which defaults to http://localhost:5173. In WebContainers, this causes
      // Chrome's Private Network Access to block the redirect. We handle
      // navigation explicitly via React Router instead.
      if (ctx.data?.redirect) {
        ctx.data.redirect = false;
        ctx.data.url = undefined;
      }
    },
  },
  sessionOptions: {
    refetchOnWindowFocus: false,
    refetchInterval: 0,
  },
});

type AuthClientWithSessionRefresh = typeof authClient & {
  updateSession?: () => void;
};

// Better Auth can flip claims such as twoFactorEnabled without rotating the
// session token. Force a fresh getSession call so protected routes see the
// updated state before navigating.
export async function refreshAuthSession() {
  await authClient.getSession();
  (authClient as AuthClientWithSessionRefresh).updateSession?.();
}
