// SPECODE-OWNED FILE. Specode restores it on every deploy, so edits here never ship.
//
// Public health check: which release the backend and the frontend are on.
// Exposes no data and no secret values.
import { httpAction } from "../_generated/server";
import { components } from "../_generated/api";

export const health = httpAction(async (ctx) => {
  const frontend = await ctx.runQuery(components.selfHosting.lib.getCurrentDeployment, {});
  return Response.json(
    {
      release: process.env.SPECODE_RELEASE ?? null,
      frontendDeploymentId: frontend?.currentDeploymentId ?? null,
      uploaderArmed: (process.env.SPECODE_UPLOAD_TOKEN ?? "").length > 0,
    },
    { headers: { "cache-control": "no-store" } },
  );
});
