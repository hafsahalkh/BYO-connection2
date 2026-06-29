import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import selfHosting from "@convex-dev/static-hosting/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(selfHosting);

export default app;
