import { ReportCard } from "./components/ReportCard";
import { useDeferredAnalytics } from "./hooks/useDeferredAnalytics";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { reports } from "./reports";
import { useAtmosphereTheme } from "./useAtmosphereTheme";

export default function App() {
  useAtmosphereTheme();
  useDeferredAnalytics();

  const prefersReducedMotion = usePrefersReducedMotion();

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
