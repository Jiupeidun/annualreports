import { ReportCard } from "./components/ReportCard";
import { useDeferredAnalytics } from "./hooks/useDeferredAnalytics";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { reports } from "./reports";
import { useAtmosphereTheme } from "./useAtmosphereTheme";

export default function App() {
  useAtmosphereTheme();
  useDeferredAnalytics();

  const prefersReducedMotion = usePrefersReducedMotion();
  const currentReport = reports.find((report) => report.versioned);

  return (
    <main className="app">
      <div className="page">
        <header className="masthead">
          <h1>Annual Reports</h1>
          {currentReport ? (
            <div className="archive-meta" aria-label="Archive status">
              <span>Current: {currentReport.year}</span>
              <span>PDF</span>
              {currentReport.period ? <span>{currentReport.period}</span> : null}
            </div>
          ) : null}
        </header>
        <section className="reports" aria-label="Annual reports">
          {reports.map((report) => (
            <ReportCard
              key={report.year}
              report={report}
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
