import { useEffect } from "react";

function postPathUpdate() {
  if (window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      type: "specode:path-update",
      path: window.location.pathname + window.location.search,
      pathname: window.location.pathname,
      search: window.location.search,
      origin: window.location.origin,
    },
    "*",
  );
}

/**
 * Tracks pathname changes when running inside Specode AI Coder iframe.
 * Posts messages to parent window so the preview toolbar stays in sync.
 * Do not remove while running inside the AI Coder.
 */
export function SpecodeIframeTracker() {
  useEffect(() => {
    if (window.parent === window) {
      return;
    }

    postPathUpdate();

    const handleLocationChange = () => {
      postPathUpdate();
    };
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = ((...args: Parameters<History["pushState"]>) => {
      originalPushState(...args);
      handleLocationChange();
    }) as History["pushState"];

    window.history.replaceState = (
      (...args: Parameters<History["replaceState"]>) => {
        originalReplaceState(...args);
        handleLocationChange();
      }
    ) as History["replaceState"];

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  return null;
}
