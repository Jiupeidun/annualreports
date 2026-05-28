import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { playCoverSound, prepareCoverSound } from "./playCoverSound";
import { appAssetPath, reports, type Report } from "./reports";
import { useAnalytics } from "./useAnalytics";
import { useAtmosphereTheme } from "./useAtmosphereTheme";

const BorderBeam = lazy(() =>
  import("border-beam").then((module) => ({ default: module.BorderBeam }))
);

function currentReportHref(): string {
  const stamp = new Date();
  const version = [
    stamp.getFullYear(),
    String(stamp.getMonth() + 1).padStart(2, "0"),
    String(stamp.getDate()).padStart(2, "0")
  ].join("");

  return `${appAssetPath("2026_Annual_Report.pdf")}?v=${version}`;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

type ReportCoverProps = {
  report: Report;
  beamActive: boolean;
  beamReady: boolean;
};

function ReportCover({ report, beamActive, beamReady }: ReportCoverProps) {
  const cover = (
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
        borderRadius={10}
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

type ReportCardProps = {
  report: Report;
  href: string;
  onRefreshHref: () => void;
  beamActive: boolean;
};

function ReportCard({ report, href, onRefreshHref, beamActive }: ReportCardProps) {
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
    if (!report.versioned || beamReady) {
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
          setBeamReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [beamReady, report.versioned]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.button !== 0) {
        return;
      }

      triggerPressEffect();
      playCoverSound();
      if (report.versioned) {
        onRefreshHref();
      }
    },
    [onRefreshHref, report.versioned, triggerPressEffect]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key !== "Enter") {
        return;
      }

      triggerPressEffect();
      playCoverSound();
      if (report.versioned) {
        onRefreshHref();
      }
    },
    [onRefreshHref, report.versioned, triggerPressEffect]
  );

  const handleFocus = useCallback(() => {
    prepareCoverSound();
    if (report.versioned) {
      onRefreshHref();
    }
  }, [onRefreshHref, report.versioned]);

  return (
    <a
      id={report.id}
      href={href}
      target="_blank"
      rel="noopener"
      className={`report-link${isClicking ? " is-clicking" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerEnter={prepareCoverSound}
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

export default function App() {
  useAtmosphereTheme();
  useAnalytics();

  const prefersReducedMotion = usePrefersReducedMotion();
  const [versionedHref, setVersionedHref] = useState(currentReportHref);
  const refreshCurrentReportHref = useCallback(() => {
    setVersionedHref(currentReportHref());
  }, []);

  return (
    <main className="app">
      <div className="page">
        <header className="masthead">
          <h1>Annual Reports</h1>
        </header>
        <section className="reports" aria-label="Annual reports">
          {reports.map((report) => (
            <ReportCard
              key={report.year}
              report={report}
              href={report.versioned ? versionedHref : report.href}
              onRefreshHref={refreshCurrentReportHref}
              beamActive={!prefersReducedMotion}
            />
          ))}
        </section>
        <footer>
          <p>&copy; Kertin. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
