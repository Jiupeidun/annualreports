import { Suspense, lazy, memo, useEffect, useState } from "react";
import type { BorderBeamColorVariant } from "border-beam";
import type { Report } from "../reports";

type BorderBeamModule = {
  default: typeof import("border-beam").BorderBeam;
};

let borderBeamPromise: Promise<BorderBeamModule> | null = null;

function loadBorderBeam(): Promise<BorderBeamModule> {
  borderBeamPromise ??= import("border-beam").then((module) => ({ default: module.BorderBeam }));
  return borderBeamPromise;
}

const BorderBeam = lazy(loadBorderBeam);
const coverRadiusPx = 10;
const coverBeamPaddingPx = 2;
const randomBuffer = new Uint32Array(1);
const borderBeamColorVariants = ["sunset", "colorful", "ocean"] as const satisfies readonly BorderBeamColorVariant[];

export function preloadBorderBeam(): void {
  void loadBorderBeam();
}

type ReportCoverProps = {
  report: Report;
  beamActive: boolean;
  beamReady: boolean;
};

type BorderBeamSettings = {
  colorVariant: BorderBeamColorVariant;
  strength: number;
  duration: number;
  brightness: number;
  saturation: number;
  hueRange: number;
};

function randomUnit(): number {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject && typeof cryptoObject.getRandomValues === "function") {
    cryptoObject.getRandomValues(randomBuffer);
    return randomBuffer[0] / 0x100000000;
  }

  return Math.random();
}

function randomBetween(min: number, max: number): number {
  return min + (max - min) * randomUnit();
}

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(randomUnit() * items.length)] ?? items[0];
}

function createBorderBeamSettings(): BorderBeamSettings {
  return {
    colorVariant: randomItem(borderBeamColorVariants),
    strength: randomBetween(0.82, 1),
    duration: randomBetween(2.35, 3.05),
    brightness: randomBetween(1.34, 1.88),
    saturation: randomBetween(1.1, 1.5),
    hueRange: randomBetween(18, 48)
  };
}

function ReportCoverComponent({ report, beamActive, beamReady }: ReportCoverProps) {
  const [beamSettings, setBeamSettings] = useState(createBorderBeamSettings);

  useEffect(() => {
    if (!report.versioned || !beamActive || !beamReady) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setBeamSettings(createBorderBeamSettings());
    }, beamSettings.duration * 1000);

    return () => window.clearTimeout(timer);
  }, [beamActive, beamReady, beamSettings.duration, report.versioned]);

  const cover = (
    <span className={`report-cover-shell${report.versioned ? " is-current" : ""}`}>
      <picture className="report-picture">
        <source srcSet={report.webp} type="image/webp" />
        <img
          className="report-cover"
          src={report.image}
          width="300"
          height="424"
          alt={report.alt}
          loading={report.eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={report.priority ? "high" : undefined}
        />
      </picture>
    </span>
  );

  if (!report.versioned || !beamActive || !beamReady) {
    return cover;
  }

  return (
    <Suspense fallback={cover}>
      <BorderBeam
        className="report-cover-beam"
        size="md"
        colorVariant={beamSettings.colorVariant}
        theme="light"
        strength={beamSettings.strength}
        duration={beamSettings.duration}
        borderRadius={coverRadiusPx + coverBeamPaddingPx}
        brightness={beamSettings.brightness}
        saturation={beamSettings.saturation}
        hueRange={beamSettings.hueRange}
        active={beamActive}
      >
        {cover}
      </BorderBeam>
    </Suspense>
  );
}

export const ReportCover = memo(ReportCoverComponent);
