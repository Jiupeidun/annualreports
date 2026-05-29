import { useEffect } from "react";

let analyticsModulePromise: Promise<typeof import("../useAnalytics")> | null = null;

function loadAnalyticsModule(): Promise<typeof import("../useAnalytics")> {
  analyticsModulePromise ??= import("../useAnalytics");
  return analyticsModulePromise;
}

export function useDeferredAnalytics(): void {
  useEffect(() => {
    if (window.__annualReportsAnalyticsLoaded) {
      return undefined;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const loadAnalytics = () => {
      if (cancelled || window.__annualReportsAnalyticsLoaded) {
        return;
      }

      void loadAnalyticsModule()
        .then(({ startAnalytics }) => {
          if (!cancelled) {
            cleanup = startAnalytics();
          }
        })
        .catch((error: unknown) => {
          if (import.meta.env.DEV) {
            console.warn("[analytics] Failed to load analytics:", error);
          }
        });
    };
    const cancelIdle = "requestIdleCallback" in window
      ? (() => {
          const id = window.requestIdleCallback(loadAnalytics, { timeout: 3200 });
          return () => window.cancelIdleCallback(id);
        })()
      : (() => {
          const id = globalThis.setTimeout(loadAnalytics, 1600);
          return () => globalThis.clearTimeout(id);
        })();

    return () => {
      cancelled = true;
      cancelIdle();
      cleanup?.();
    };
  }, []);
}
