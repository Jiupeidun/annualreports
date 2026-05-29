import { palettes, type Palette } from "./palette";

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Oklch = {
  l: number;
  c: number;
  h: number;
};

type BaseAtmosphereModel = {
  light: number;
  flow: number;
  palette: Palette;
};

export type AtmosphereModel = BaseAtmosphereModel & {
  fluidAX: number;
  fluidAY: number;
  fluidBX: number;
  fluidBY: number;
  fluidCX: number;
  fluidCY: number;
};

type ThemeStop = {
  at: number;
  palette: Palette;
  light: number;
  flow: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): Rgb {
  const raw = hex.replace("#", "");
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16)
  };
}

function rgbToHex(rgb: Rgb): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((part) => Math.round(part).toString(16).padStart(2, "0"))
    .join("")}`;
}

function srgbToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function linearToSrgb(value: number): number {
  const channel = value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  return clamp(Math.round(channel * 255), 0, 255);
}

function hexToOklch(hex: string): Oklch {
  const rgb = hexToRgb(hex);
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  const okL = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const okA = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const okB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  return {
    l: okL,
    c: Math.sqrt(okA * okA + okB * okB),
    h: (Math.atan2(okB, okA) * 180) / Math.PI
  };
}

function oklchToHex(color: Oklch): string {
  const hue = (color.h * Math.PI) / 180;
  const a = Math.cos(hue) * color.c;
  const b = Math.sin(hue) * color.c;
  const lRoot = color.l + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = color.l - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = color.l - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot * lRoot * lRoot;
  const m = mRoot * mRoot * mRoot;
  const s = sRoot * sRoot * sRoot;

  return rgbToHex({
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  });
}

function mixHue(a: Oklch, b: Oklch, progress: number): number {
  if (a.c < 0.0001) {
    return b.h;
  }

  if (b.c < 0.0001) {
    return a.h;
  }

  const delta = ((b.h - a.h + 540) % 360) - 180;
  return a.h + delta * progress;
}

function mixColor(a: string, b: string, progress: number): string {
  const from = hexToOklch(a);
  const to = hexToOklch(b);
  return oklchToHex({
    l: from.l + (to.l - from.l) * progress,
    c: from.c + (to.c - from.c) * progress,
    h: mixHue(from, to, progress)
  });
}

function mixPalette(a: Palette, b: Palette, progress: number): Palette {
  const palette = {} as Palette;
  (Object.keys(a) as Array<keyof Palette>).forEach((key) => {
    palette[key] = mixColor(a[key], b[key], progress);
  });
  return palette;
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
    fluidAX: clamp(22 + Math.cos(angle * 0.76) * 12, 6, 40),
    fluidAY: clamp(22 + Math.sin(angle * 0.9) * 13 + nightLift * 6, 6, 48),
    fluidBX: clamp(78 + Math.sin(angle * 0.72 + 1.4) * 13, 58, 96),
    fluidBY: clamp(30 + Math.cos(angle * 0.86 + 0.6) * 17, 8, 56),
    fluidCX: clamp(50 + Math.cos(angle * 0.54 + 2.5) * 18, 22, 78),
    fluidCY: clamp(82 + Math.sin(angle * 0.68 + 2.1) * 9 - model.light * 7, 60, 94)
  };
}

export function buildAtmosphereModel(now: Date, timeZone: string): AtmosphereModel {
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
