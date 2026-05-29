export type Palette = {
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

export type PaletteName = "midnightPurple" | "dawn" | "morning" | "noonBlue" | "lightBlue" | "lightViolet";

export const palettes: Record<PaletteName, Palette> = {
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
