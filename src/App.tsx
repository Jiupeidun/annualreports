import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { SensoryUIProvider } from "@/components/ui/sensory-ui/config/provider";
import { usePlaySound } from "@/components/ui/sensory-ui/config/use-play-sound";
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
};

function ReportCover({ report, beamActive }: ReportCoverProps) {
  const cover = (
    <picture className="report-picture">
      <source srcSet={report.webp} type="image/webp" />
      <img
        className="report-cover"
        src={report.image}
        width="300"
        height="424"
        alt={report.alt}
        loading={report.eager ? undefined : "lazy"}
        decoding="async"
        fetchPriority={report.eager ? "high" : undefined}
      />
    </picture>
  );

  if (!report.versioned) {
    return cover;
  }

  return (
    <Suspense fallback={cover}>
      <BorderBeam
        className="report-cover-beam"
        size="md"
        colorVariant="ocean"
        theme="light"
        strength={0.5}
        duration={3.4}
        borderRadius={8}
        brightness={1.12}
        saturation={0.96}
        hueRange={18}
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
  const { play } = usePlaySound({ sound: "interaction.toggle", volume: 0.5 });
  const pulseTimer = useRef(0);
  const [isClicking, setIsClicking] = useState(false);

  const triggerPressEffect = useCallback(() => {
    window.clearTimeout(pulseTimer.current);
    setIsClicking(false);
    window.requestAnimationFrame(() => {
      setIsClicking(true);
      pulseTimer.current = window.setTimeout(() => setIsClicking(false), 520);
    });
  }, []);

  useEffect(() => () => window.clearTimeout(pulseTimer.current), []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.button !== 0) {
        return;
      }

      triggerPressEffect();
      play();
      if (report.versioned) {
        onRefreshHref();
      }
    },
    [onRefreshHref, play, report.versioned, triggerPressEffect]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key !== "Enter") {
        return;
      }

      triggerPressEffect();
      play();
      if (report.versioned) {
        onRefreshHref();
      }
    },
    [onRefreshHref, play, report.versioned, triggerPressEffect]
  );

  return (
    <a
      id={report.id}
      href={href}
      target="_blank"
      rel="noopener"
      className={`report-link${isClicking ? " is-clicking" : ""}`}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onFocus={report.versioned ? onRefreshHref : undefined}
    >
      <span className="report-cover-frame">
        <ReportCover report={report} beamActive={beamActive} />
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
    <SensoryUIProvider config={{ theme: "soft", volume: 0.12 }}>
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
    </SensoryUIProvider>
  );
}
