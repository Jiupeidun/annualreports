import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { currentReportHref } from "../lib/currentReportHref";
import { playCoverSound } from "../playCoverSound";
import type { Report } from "../reports";
import { preloadBorderBeam, ReportCover } from "./ReportCover";

type ReportCardProps = {
  report: Report;
  beamActive: boolean;
};

function ReportCardComponent({ report, beamActive }: ReportCardProps) {
  const coverFrameRef = useRef<HTMLSpanElement | null>(null);
  const pulseTimer = useRef(0);
  const [isClicking, setIsClicking] = useState(false);
  const [beamReady, setBeamReady] = useState(!report.versioned);

  const triggerPressEffect = useCallback(() => {
    window.clearTimeout(pulseTimer.current);
    setIsClicking(false);
    window.requestAnimationFrame(() => {
      setIsClicking(true);
      pulseTimer.current = window.setTimeout(() => setIsClicking(false), 520);
    });
  }, []);

  useEffect(() => () => window.clearTimeout(pulseTimer.current), []);

  useEffect(() => {
    if (!report.versioned || !beamActive || beamReady) {
      return;
    }

    const node = coverFrameRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setBeamReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          preloadBorderBeam();
          setBeamReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [beamActive, beamReady, report.versioned]);

  const refreshReportHref = useCallback(
    (target: HTMLAnchorElement) => {
      if (report.versioned) {
        target.href = currentReportHref();
      }
    },
    [report.versioned]
  );

  const preloadReportEnhancements = useCallback(() => {
    if (report.versioned && beamActive) {
      preloadBorderBeam();
    }
  }, [beamActive, report.versioned]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.button !== 0) {
        return;
      }

      refreshReportHref(event.currentTarget);
      triggerPressEffect();
      playCoverSound();
    },
    [refreshReportHref, triggerPressEffect]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key !== "Enter") {
        return;
      }

      refreshReportHref(event.currentTarget);
      triggerPressEffect();
      playCoverSound();
    },
    [refreshReportHref, triggerPressEffect]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      refreshReportHref(event.currentTarget);
      preloadReportEnhancements();
    },
    [preloadReportEnhancements, refreshReportHref]
  );

  return (
    <a
      id={report.id}
      href={report.href}
      target="_blank"
      rel="noopener"
      className={`report-link${isClicking ? " is-clicking" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerEnter={preloadReportEnhancements}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
      <span ref={coverFrameRef} className="report-cover-frame">
        <ReportCover report={report} beamActive={beamActive} beamReady={beamReady} />
      </span>
      <span className="report-meta">
        <span className="report-year">{report.year}</span>
        <span className="report-period">{report.period}</span>
      </span>
    </a>
  );
}

export const ReportCard = memo(ReportCardComponent);
