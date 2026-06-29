import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { components } from "./_generated/api";
import { authClient, createAuth } from "./auth";

const http = httpRouter();

authClient.registerRoutes(http, createAuth, { cors: true });
registerStaticRoutes(http, components.selfHosting);

export default http;
