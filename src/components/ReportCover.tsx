import { Suspense, lazy, memo } from "react";
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

export function preloadBorderBeam(): void {
  void loadBorderBeam();
}

type ReportCoverProps = {
  report: Report;
  beamActive: boolean;
  beamReady: boolean;
};

function ReportCoverComponent({ report, beamActive, beamReady }: ReportCoverProps) {
  const cover = (
    <span className={`report-cover-shell${report.versioned ? " is-current" : ""}`}>
      <picture className="report-picture">
        {report.webp ? <source srcSet={report.webp} type="image/webp" /> : null}
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
        colorVariant="sunset"
        theme="light"
        strength={1}
        duration={2.65}
        borderRadius={coverRadiusPx + coverBeamPaddingPx}
        brightness={1.62}
        saturation={1.34}
        hueRange={32}
        active={beamActive}
      >
        {cover}
      </BorderBeam>
    </Suspense>
  );
}

export const ReportCover = memo(ReportCoverComponent);
