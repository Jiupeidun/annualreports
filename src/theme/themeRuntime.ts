import { createThemeVarWriter } from "./applyThemeVars";
import { buildAtmosphereModel } from "./timeTheme";

function parseDebugTime(): Date | null {
  const value = new URLSearchParams(window.location.search).get("time");
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.valueOf()) ? date : null;
}

export function startAtmosphereTheme(): () => void {
  const writeThemeVars = createThemeVarWriter(
    document.documentElement.style,
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  );
  const debugTime = parseDebugTime();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai";
  let themeTimer = 0;
  let cancelled = false;

  function getThemeTime(): Date {
    return debugTime || new Date();
  }

  function applyTheme(): void {
    writeThemeVars(buildAtmosphereModel(getThemeTime(), timeZone));
  }

  function scheduleTheme(): void {
    window.clearTimeout(themeTimer);
    if (cancelled || document.visibilityState === "hidden") {
      return;
    }

    applyTheme();
    if (debugTime) {
      return;
    }

    themeTimer = window.setTimeout(scheduleTheme, 60000 - (Date.now() % 60000));
  }

  document.addEventListener("visibilitychange", scheduleTheme, { passive: true });
  window.addEventListener("pageshow", scheduleTheme, { passive: true });
  scheduleTheme();

  return () => {
    cancelled = true;
    window.clearTimeout(themeTimer);
    document.removeEventListener("visibilitychange", scheduleTheme);
    window.removeEventListener("pageshow", scheduleTheme);
  };
}
