import { useEffect } from "react";

export function useAtmosphereTheme(): void {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    import("./theme/themeRuntime")
      .then(({ startAtmosphereTheme }) => {
        if (cancelled) {
          return;
        }

        cleanup = startAtmosphereTheme();
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.warn("[theme] Failed to load atmosphere theme:", error);
        }
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}
