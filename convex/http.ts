import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { components } from "./_generated/api";
import { authClient, createAuth } from "./auth";
import { stripeWebhook } from "./billing/webhook";

const http = httpRouter();

authClient.registerRoutes(http, createAuth, { cors: true });
registerStaticRoutes(http, components.selfHosting);

// Stripe webhook endpoint. Registered at the exact path the user copies into
// the Stripe Dashboard: <convex site url>/api/stripe/webhook
http.route({
  path: "/api/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
