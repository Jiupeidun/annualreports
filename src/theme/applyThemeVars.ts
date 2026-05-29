import type { AtmosphereModel } from "./timeTheme";

type Rgb = {
  r: number;
  g: number;
  b: number;
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

function toLinearChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  return 0.2126 * toLinearChannel(rgb.r) + 0.7152 * toLinearChannel(rgb.g) + 0.0722 * toLinearChannel(rgb.b);
}

function rgbCsv(hex: string): string {
  const rgb = hexToRgb(hex);
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

export function createThemeVarWriter(
  rootStyle: CSSStyleDeclaration,
  themeMeta: HTMLMetaElement | null
): (model: AtmosphereModel) => void {
  const activeVars: Record<string, string> = {};

  return (model: AtmosphereModel): void => {
    const p = model.palette;
    const backgroundIsLight = luminance(p.skyTop) > 0.5 || luminance(p.skyMid) > 0.5 || luminance(p.ground) > 0.5;
    const flowFieldStrength = clamp(0.38 + model.flow * 0.3 + model.light * 0.12, 0.38, 0.84);
    const primaryText = backgroundIsLight ? "#071827" : "#f6efff";
    const mutedText = backgroundIsLight ? "#243f56" : "#dbcaff";
    const titleShadow = backgroundIsLight
      ? "0 1px 1px rgba(255, 255, 255, .42), 0 10px 30px rgba(30, 84, 140, .16)"
      : "0 1px 2px rgba(0, 0, 0, .32), 0 10px 28px rgba(0, 0, 0, .22)";
    const strongShadow = backgroundIsLight
      ? "0 1px 1px rgba(255, 255, 255, .38), 0 8px 22px rgba(26, 80, 130, .15)"
      : "0 1px 2px rgba(0, 0, 0, .34), 0 8px 22px rgba(0, 0, 0, .2)";
    const mutedShadow = backgroundIsLight
      ? "0 1px 1px rgba(255, 255, 255, .32), 0 6px 18px rgba(26, 80, 130, .12)"
      : "0 1px 2px rgba(0, 0, 0, .3)";
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
      "--blue-block-alpha": String((flowFieldStrength * 0.2).toFixed(3)),
      "--blue-block-soft-alpha": String((flowFieldStrength * 0.1).toFixed(3)),
      "--red-block-alpha": String((flowFieldStrength * 0.18).toFixed(3)),
      "--red-block-soft-alpha": String((flowFieldStrength * 0.085).toFixed(3)),
      "--fluid-a-alpha": String(clamp(0.3 + model.light * 0.24, 0.3, 0.54).toFixed(3)),
      "--fluid-a-soft-alpha": String(clamp(0.1 + model.light * 0.1, 0.1, 0.2).toFixed(3)),
      "--fluid-b-alpha": String(clamp(0.28 + model.light * 0.22, 0.28, 0.5).toFixed(3)),
      "--fluid-b-soft-alpha": String(clamp(0.1 + model.light * 0.1, 0.1, 0.2).toFixed(3)),
      "--fluid-c-alpha": String(clamp(0.24 + model.light * 0.2, 0.24, 0.44).toFixed(3)),
      "--fluid-c-soft-alpha": String(clamp(0.09 + model.light * 0.08, 0.09, 0.17).toFixed(3)),
      "--energy-alpha": String(clamp(0.12 + model.light * 0.1, 0.12, 0.22).toFixed(3)),
      "--energy-soft-alpha": String(clamp(0.065 + model.light * 0.07, 0.065, 0.135).toFixed(3)),
      "--ridge-alpha": String(clamp(0.14 + flowFieldStrength * 0.14, 0.14, 0.28).toFixed(3)),
      "--ridge-soft-alpha": String(clamp(0.07 + flowFieldStrength * 0.09, 0.07, 0.15).toFixed(3)),
      "--ridge-glow-alpha": String(clamp(0.08 + flowFieldStrength * 0.1, 0.08, 0.18).toFixed(3)),
      "--flow-band-alpha": String(clamp(0.12 + flowFieldStrength * 0.18, 0.12, 0.3).toFixed(3)),
      "--flow-band-soft-alpha": String(clamp(0.06 + flowFieldStrength * 0.1, 0.06, 0.16).toFixed(3)),
      "--flow-veil-alpha": String(clamp(0.06 + flowFieldStrength * 0.12, 0.06, 0.18).toFixed(3)),
      "--mist-alpha": String(clamp(0.04 + model.light * 0.07, 0.04, 0.11).toFixed(3)),
      "--sheen-alpha": String(clamp(0.04 + model.light * 0.06, 0.04, 0.1).toFixed(3)),
      "--horizon-alpha": String(clamp(0.1 + model.light * 0.12, 0.1, 0.22).toFixed(3)),
      "--vignette-alpha": String(clamp(0.04 + (1 - model.light) * 0.1, 0.04, 0.14).toFixed(3)),
      "--glow-layer-opacity": String(clamp(0.36 + model.light * 0.16, 0.36, 0.52).toFixed(3)),
      "--texture-layer-opacity": String(clamp(0.1 + (1 - model.light) * 0.07, 0.1, 0.17).toFixed(3)),
      "--content-veil-alpha": String(clamp(0.08 + model.light * 0.08, 0.08, 0.16).toFixed(3)),
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
  };
}
