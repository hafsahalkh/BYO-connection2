// SPECODE-OWNED FILE. Specode restores it on every deploy, so edits here never ship.
//
// Registers the Specode routes on the app's HTTP router (convex/http.ts calls
// registerSpecodeRoutes(http) once, after the static hosting routes).
import type { HttpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { health } from "./health";
import { finalizeRelease, uploadAsset } from "./uploader";

type RouteHandler = (ctx: unknown, request: Request) => Promise<Response>;

export function registerSpecodeRoutes(http: HttpRouter): void {
  http.route({ path: "/__specode/upload", method: "POST", handler: uploadAsset });
  http.route({ path: "/__specode/finalize", method: "POST", handler: finalizeRelease });
  http.route({ path: "/__specode/health", method: "GET", handler: health });
  redirectSiteToCustomDomain(http);
}

/**
 * Where a request to the old *.convex.site address should go once the app has
 * a custom domain (SITE_URL), or null to serve it there. Convex marks requests
 * that arrive through a custom domain with x-convex-custom-domain.
 */
export function customDomainRedirect(requestUrl: string, headers: Headers, siteUrl: string | undefined): string | null {
  if (!siteUrl || headers.get("x-convex-custom-domain")) return null;
  let target: URL;
  let url: URL;
  try {
    target = new URL(siteUrl);
    url = new URL(requestUrl);
  } catch {
    return null;
  }
  if (target.protocol !== "https:" || target.hostname.endsWith(".convex.site")) return null;
  if (!url.hostname.endsWith(".convex.site") || url.hostname === target.hostname) return null;
  return `${target.origin}${url.pathname}${url.search}`;
}

// Page and asset requests that the static site answers are sent to the custom
// domain, so visitors (and sign-in) end up on one site. Exact routes (auth,
// webhooks, Specode's own) and other methods are untouched. Without a
// catch-all GET route, or on a Convex version that hides its handler, this
// does nothing.
function redirectSiteToCustomDomain(http: HttpRouter): void {
  const getRoutes = http.prefixRoutes.get("GET");
  const site = getRoutes?.get("/") as unknown as { _handler?: RouteHandler } | undefined;
  if (!getRoutes || typeof site?._handler !== "function") return;
  const serveSite = site._handler;
  getRoutes.set(
    "/",
    httpAction(async (ctx, request) => {
      const location = customDomainRedirect(request.url, request.headers, process.env.SITE_URL);
      if (location) return new Response(null, { status: 302, headers: { location, "cache-control": "no-store" } });
      return serveSite(ctx, request);
    }),
  );
}
