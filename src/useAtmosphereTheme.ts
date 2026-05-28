import { useEffect } from "react";

type Palette = {
  skyBase: string;
  skyTop: string;
  skyMid: string;
  ground: string;
  text: string;
  muted: string;
  surface: string;
  line: string;
  accent: string;
  ambient: string;
  mist: string;
  sheen: string;
  energy: string;
  energyCore: string;
  fluidA: string;
  fluidB: string;
  fluidC: string;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type BaseAtmosphereModel = {
  light: number;
  flow: number;
  palette: Palette;
};

type AtmosphereModel = BaseAtmosphereModel & {
  fluidAX: number;
  fluidAY: number;
  fluidBX: number;
  fluidBY: number;
  fluidCX: number;
  fluidCY: number;
};

type PaletteName = "midnightPurple" | "dawn" | "morning" | "noonBlue" | "lightBlue" | "lightViolet";

const palettes: Record<PaletteName, Palette> = {
  midnightPurple: {
    skyBase: "#16042a",
    skyTop: "#16003a",
    skyMid: "#32116f",
    ground: "#5a33a2",
    text: "#f6efff",
    muted: "#dbcaff",
    surface: "#1b0a3b",
    line: "#7f5dd0",
    accent: "#c6a8ff",
    ambient: "#351274",
    mist: "#f3eaff",
    sheen: "#a885ff",
    energy: "#a46dff",
    energyCore: "#eadcff",
    fluidA: "#7c5cff",
    fluidB: "#4e86ff",
    fluidC: "#d987ff"
  },
  dawn: {
    skyBase: "#f3fbff",
    skyTop: "#eaf7ff",
    skyMid: "#cce9ff",
    ground: "#d8ddff",
    text: "#10243d",
    muted: "#385b75",
    surface: "#f1faff",
    line: "#5e85aa",
    accent: "#5c91e5",
    ambient: "#bce7ff",
    mist: "#ffffff",
    sheen: "#c3f2f0",
    energy: "#b7dcff",
    energyCore: "#f3fbff",
    fluidA: "#bff0ee",
    fluidB: "#bfd5ff",
    fluidC: "#ead6ff"
  },
  morning: {
    skyBase: "#e8f6ff",
    skyTop: "#d9efff",
    skyMid: "#9dcfff",
    ground: "#bdd1ff",
    text: "#0f2542",
    muted: "#355d80",
    surface: "#edf8ff",
    line: "#4f80b9",
    accent: "#458de8",
    ambient: "#9fd5ff",
    mist: "#ffffff",
    sheen: "#b6edf0",
    energy: "#8cc4ff",
    energyCore: "#eef8ff",
    fluidA: "#9be8f0",
    fluidB: "#8ebcff",
    fluidC: "#d9c3ff"
  },
  noonBlue: {
    skyBase: "#0b3a78",
    skyTop: "#092f72",
    skyMid: "#236bc3",
    ground: "#72aef0",
    text: "#edf7ff",
    muted: "#c5ddfa",
    surface: "#d9ecff",
    line: "#78a9ec",
    accent: "#7fc6ff",
    ambient: "#1f75cc",
    mist: "#eaf7ff",
    sheen: "#75e3ee",
    energy: "#65b7ff",
    energyCore: "#def4ff",
    fluidA: "#4bdde6",
    fluidB: "#4f9fff",
    fluidC: "#c9a8ff"
  },
  lightBlue: {
    skyBase: "#e8f6ff",
    skyTop: "#dff2ff",
    skyMid: "#a6d6ff",
    ground: "#c3cdfd",
    text: "#102442",
    muted: "#365d7d",
    surface: "#eff8ff",
    line: "#5c8fc8",
    accent: "#5d93e9",
    ambient: "#a7dcff",
    mist: "#ffffff",
    sheen: "#a8f0f1",
    energy: "#91caff",
    energyCore: "#f1f9ff",
    fluidA: "#9eeff0",
    fluidB: "#95c4ff",
    fluidC: "#f0bfef"
  },
  lightViolet: {
    skyBase: "#f1ecff",
    skyTop: "#d8c9ff",
    skyMid: "#bba2ff",
    ground: "#aeb2ff",
    text: "#211b38",
    muted: "#5a4d78",
    surface: "#f3efff",
    line: "#7d63c8",
    accent: "#8d6dec",
    ambient: "#bca7ff",
    mist: "#ffffff",
    sheen: "#d6c8ff",
    energy: "#a88eff",
    energyCore: "#f3eeff",
    fluidA: "#c4b2ff",
    fluidB: "#98b9ff",
    fluidC: "#e9b8ff"
  }
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseDebugTime(): Date | null {
  const value = new URLSearchParams(window.location.search).get("time");
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.valueOf()) ? date : null;
}

function getZonedMinuteOfDay(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const values: Record<string, string> = {};

  formatter.formatToParts(date).forEach((part) => {
    values[part.type] = part.value;
  });

  return Number(values.hour) * 60 + Number(values.minute);
}

function hexToRgb(hex: string): Rgb {
  const raw = hex.replace("#", "");
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16)
  };
}

function toLinearChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  return 0.2126 * toLinearChannel(rgb.r) + 0.7152 * toLinearChannel(rgb.g) + 0.0722 * toLinearChannel(rgb.b);
}

function rgbToHex(rgb: Rgb): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((part) => Math.round(part).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t
  });
}

function mixPalette(a: Palette, b: Palette, t: number): Palette {
  const palette = {} as Palette;
  (Object.keys(a) as Array<keyof Palette>).forEach((key) => {
    palette[key] = mixColor(a[key], b[key], t);
  });
  return palette;
}

function rgbCsv(hex: string): string {
  const rgb = hexToRgb(hex);
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

type ThemeStop = {
  at: number;
  palette: Palette;
  light: number;
  flow: number;
};

function easeInOutSine(value: number): number {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function linearTheme(
  from: Palette,
  to: Palette,
  progress: number,
  fromLight: number,
  toLight: number,
  fromFlow: number,
  toFlow: number
): BaseAtmosphereModel {
  return {
    light: fromLight + (toLight - fromLight) * progress,
    flow: fromFlow + (toFlow - fromFlow) * progress,
    palette: mixPalette(from, to, progress)
  };
}

function themeFromStops(stops: ThemeStop[], progress: number): BaseAtmosphereModel {
  const position = clamp(progress, 0, 1);

  for (let index = 0; index < stops.length - 1; index += 1) {
    const current = stops[index];
    const next = stops[index + 1];

    if (position <= next.at) {
      const segmentProgress = easeInOutSine((position - current.at) / (next.at - current.at));
      return linearTheme(
        current.palette,
        next.palette,
        segmentProgress,
        current.light,
        next.light,
        current.flow,
        next.flow
      );
    }
  }

  const last = stops[stops.length - 1];
  return {
    light: last.light,
    flow: last.flow,
    palette: last.palette
  };
}

function withFluidFields(model: BaseAtmosphereModel): AtmosphereModel {
  const angle = model.flow * Math.PI * 2;
  const nightLift = 1 - model.light;
  return {
    ...model,
    fluidAX: clamp(24 + Math.cos(angle * 0.76) * 10, 10, 42),
    fluidAY: clamp(24 + Math.sin(angle * 0.9) * 12 + nightLift * 6, 8, 48),
    fluidBX: clamp(74 + Math.sin(angle * 0.72 + 1.4) * 12, 55, 92),
    fluidBY: clamp(32 + Math.cos(angle * 0.86 + 0.6) * 16, 12, 58),
    fluidCX: clamp(50 + Math.cos(angle * 0.54 + 2.5) * 16, 28, 72),
    fluidCY: clamp(78 + Math.sin(angle * 0.68 + 2.1) * 8 - model.light * 6, 58, 90)
  };
}

function buildAtmosphereModel(now: Date, timeZone: string): AtmosphereModel {
  const minute = getZonedMinuteOfDay(now, timeZone);

  if (minute >= 12 * 60) {
    return withFluidFields(themeFromStops(
      [
        { at: 0, palette: palettes.noonBlue, light: 0.34, flow: 0.42 },
        { at: 0.29, palette: palettes.lightBlue, light: 0.86, flow: 0.64 },
        { at: 0.55, palette: palettes.lightViolet, light: 0.82, flow: 0.82 },
        { at: 1, palette: palettes.midnightPurple, light: 0.1, flow: 1.18 }
      ],
      (minute - 12 * 60) / (12 * 60)
    ));
  }

  if (minute < 5 * 60) {
    return withFluidFields(linearTheme(
      palettes.midnightPurple,
      palettes.dawn,
      easeInOutSine(minute / (5 * 60)),
      0.1,
      0.48,
      1.18,
      0.18
    ));
  }

  return withFluidFields(themeFromStops(
    [
      { at: 0, palette: palettes.dawn, light: 0.48, flow: 0.18 },
      { at: 0.5, palette: palettes.morning, light: 0.88, flow: 0.32 },
      { at: 1, palette: palettes.noonBlue, light: 0.34, flow: 0.42 }
    ],
    (minute - 5 * 60) / (7 * 60)
  ));
}

export function useAtmosphereTheme(): void {
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const activeVars: Record<string, string> = {};
    const debugTime = parseDebugTime();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai";
    let themeTimer = 0;
    let cancelled = false;

    function getThemeTime() {
      return debugTime || new Date();
    }

    function setThemeVars(model: AtmosphereModel): void {
      const p = model.palette;
      const backgroundIsLight = luminance(p.skyTop) > 0.5 || luminance(p.skyMid) > 0.5 || luminance(p.ground) > 0.5;
      const useDarkText = backgroundIsLight;
      const flowFieldStrength = clamp(0.42 + model.flow * 0.34 + model.light * 0.16, 0.42, 0.92);
      const primaryText = useDarkText ? "#050505" : "#f6efff";
      const mutedText = useDarkText ? "#141414" : "#dacdff";
      const titleShadow = useDarkText ? "none" : "0 1px 14px rgba(0, 0, 0, .18)";
      const strongShadow = useDarkText ? "none" : "0 1px 10px rgba(0, 0, 0, .14)";
      const mutedShadow = useDarkText ? "none" : "0 1px 8px rgba(0, 0, 0, .12)";
      const vars: Record<string, string> = {
        "--sky-base": p.skyBase,
        "--sky-top": p.skyTop,
        "--sky-mid": p.skyMid,
        "--ground": p.ground,
        "--page-text": primaryText,
        "--muted-text": mutedText,
        "--meta-text": primaryText,
        "--meta-muted-text": mutedText,
        "--title-shadow": titleShadow,
        "--meta-strong-shadow": strongShadow,
        "--meta-muted-shadow": mutedShadow,
        "--surface-rgb": rgbCsv(p.surface),
        "--line-rgb": rgbCsv(p.line),
        "--surface-alpha": String(clamp(0.62 + (1 - model.light) * 0.18, 0.62, 0.84).toFixed(3)),
        "--line-alpha": String(clamp(0.13 + (1 - model.light) * 0.1, 0.13, 0.26).toFixed(3)),
        "--accent": p.accent,
        "--ambient-rgb": rgbCsv(p.ambient),
        "--mist-rgb": rgbCsv(p.mist),
        "--sheen-rgb": rgbCsv(p.sheen),
        "--energy-rgb": rgbCsv(p.energy),
        "--energy-core-rgb": rgbCsv(p.energyCore),
        "--fluid-a-rgb": rgbCsv(p.fluidA),
        "--fluid-b-rgb": rgbCsv(p.fluidB),
        "--fluid-c-rgb": rgbCsv(p.fluidC),
        "--blue-block-rgb": rgbCsv(p.energy),
        "--red-block-rgb": rgbCsv(p.fluidC),
        "--blue-block-alpha": String((flowFieldStrength * 0.26).toFixed(3)),
        "--blue-block-soft-alpha": String((flowFieldStrength * 0.13).toFixed(3)),
        "--red-block-alpha": String((flowFieldStrength * 0.22).toFixed(3)),
        "--red-block-soft-alpha": String((flowFieldStrength * 0.105).toFixed(3)),
        "--fluid-a-alpha": String(clamp(0.36 + model.light * 0.28, 0.36, 0.64).toFixed(3)),
        "--fluid-a-soft-alpha": String(clamp(0.13 + model.light * 0.12, 0.13, 0.25).toFixed(3)),
        "--fluid-b-alpha": String(clamp(0.34 + model.light * 0.26, 0.34, 0.6).toFixed(3)),
        "--fluid-b-soft-alpha": String(clamp(0.12 + model.light * 0.12, 0.12, 0.24).toFixed(3)),
        "--fluid-c-alpha": String(clamp(0.3 + model.light * 0.22, 0.3, 0.52).toFixed(3)),
        "--fluid-c-soft-alpha": String(clamp(0.11 + model.light * 0.1, 0.11, 0.21).toFixed(3)),
        "--energy-alpha": String(clamp(0.14 + model.light * 0.12, 0.14, 0.26).toFixed(3)),
        "--energy-soft-alpha": String(clamp(0.08 + model.light * 0.08, 0.08, 0.16).toFixed(3)),
        "--ridge-alpha": String(clamp(0.16 + flowFieldStrength * 0.16, 0.16, 0.31).toFixed(3)),
        "--ridge-soft-alpha": String(clamp(0.08 + flowFieldStrength * 0.1, 0.08, 0.17).toFixed(3)),
        "--ridge-glow-alpha": String(clamp(0.1 + flowFieldStrength * 0.11, 0.1, 0.2).toFixed(3)),
        "--flow-band-alpha": String(clamp(0.16 + flowFieldStrength * 0.22, 0.16, 0.35).toFixed(3)),
        "--flow-band-soft-alpha": String(clamp(0.08 + flowFieldStrength * 0.12, 0.08, 0.19).toFixed(3)),
        "--flow-veil-alpha": String(clamp(0.08 + flowFieldStrength * 0.16, 0.08, 0.22).toFixed(3)),
        "--mist-alpha": String(clamp(0.035 + model.light * 0.085, 0.035, 0.12).toFixed(3)),
        "--sheen-alpha": String(clamp(0.055 + model.light * 0.075, 0.055, 0.13).toFixed(3)),
        "--horizon-alpha": String(clamp(0.12 + model.light * 0.14, 0.12, 0.26).toFixed(3)),
        "--vignette-alpha": String(clamp(0.035 + (1 - model.light) * 0.095, 0.035, 0.13).toFixed(3)),
        "--glow-layer-opacity": String(clamp(0.48 + model.light * 0.2, 0.48, 0.68).toFixed(3)),
        "--texture-layer-opacity": String(clamp(0.12 + (1 - model.light) * 0.08, 0.12, 0.2).toFixed(3)),
        "--fluid-a-x": `${model.fluidAX.toFixed(2)}%`,
        "--fluid-a-y": `${model.fluidAY.toFixed(2)}%`,
        "--fluid-b-x": `${model.fluidBX.toFixed(2)}%`,
        "--fluid-b-y": `${model.fluidBY.toFixed(2)}%`,
        "--fluid-c-x": `${model.fluidCX.toFixed(2)}%`,
        "--fluid-c-y": `${model.fluidCY.toFixed(2)}%`
      };

      if (themeMeta && themeMeta.content !== p.skyTop) {
        themeMeta.content = p.skyTop;
      }

      Object.entries(vars).forEach(([name, value]) => {
        if (activeVars[name] !== value) {
          activeVars[name] = value;
          rootStyle.setProperty(name, value);
        }
      });
    }

    function applyTheme(): void {
      setThemeVars(buildAtmosphereModel(getThemeTime(), timeZone));
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
  }, []);
}
