import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import "./index.css";
import App from "./App.tsx";
import { convex, isConvexConfigured } from "./lib/convex.ts";
import { authClient } from "./lib/auth-client.ts";

const app = <App />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isConvexConfigured ? (
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        {app}
      </ConvexBetterAuthProvider>
    ) : (
      app
    )}
  </StrictMode>
);
