// SPECODE-OWNED FILE. Specode restores it on every deploy, so edits here never ship.
//
// Restricted frontend uploader: lets a release publish static assets over HTTPS
// without the deploy key running any internal function. Specode sets a fresh
// SPECODE_UPLOAD_TOKEN (deploy keys can write env vars) right before uploading
// and removes it right after, so these endpoints are dead between releases.
import { httpAction } from "../_generated/server";
import { components } from "../_generated/api";

const MIN_TOKEN_LENGTH = 32;
const MAX_ASSET_BYTES = 15 * 1024 * 1024;
const SAFE_PATH = /^\/[A-Za-z0-9._\-/]{1,512}$/;
const SAFE_DEPLOYMENT_ID = /^[A-Za-z0-9-]{8,64}$/;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.SPECODE_UPLOAD_TOKEN ?? "";
  if (expected.length < MIN_TOKEN_LENGTH) return false;
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  return constantTimeEqual(header.slice("Bearer ".length), expected);
}

function isSafePath(path: string): boolean {
  return SAFE_PATH.test(path) && !path.split("/").includes("..") && !path.includes("//");
}

export const uploadAsset = httpAction(async (ctx, request) => {
  if (!isAuthorized(request)) return new Response("unauthorized", { status: 401 });
  const url = new URL(request.url);
  const path = url.searchParams.get("path") ?? "";
  const deploymentId = url.searchParams.get("deploymentId") ?? "";
  if (!isSafePath(path)) return new Response("bad path", { status: 400 });
  if (!SAFE_DEPLOYMENT_ID.test(deploymentId)) return new Response("bad deploymentId", { status: 400 });

  const blob = await request.blob();
  if (blob.size > MAX_ASSET_BYTES) return new Response("too large", { status: 413 });
  const contentType = request.headers.get("content-type") ?? "application/octet-stream";

  const storageId = await ctx.storage.store(blob);
  const { oldStorageId } = await ctx.runMutation(components.selfHosting.lib.recordAsset, {
    path,
    storageId,
    contentType,
    deploymentId,
  });
  if (oldStorageId) await ctx.storage.delete(oldStorageId);
  return Response.json({ ok: true, path, bytes: blob.size });
});

export const finalizeRelease = httpAction(async (ctx, request) => {
  if (!isAuthorized(request)) return new Response("unauthorized", { status: 401 });
  const { deploymentId } = (await request.json()) as { deploymentId?: string };
  if (!deploymentId || !SAFE_DEPLOYMENT_ID.test(deploymentId)) {
    return new Response("bad deploymentId", { status: 400 });
  }
  const { storageIds } = await ctx.runMutation(components.selfHosting.lib.gcOldAssets, {
    currentDeploymentId: deploymentId,
  });
  for (const id of storageIds) await ctx.storage.delete(id);
  await ctx.runMutation(components.selfHosting.lib.setCurrentDeployment, { deploymentId });
  return Response.json({ ok: true, deletedOldAssets: storageIds.length });
});
