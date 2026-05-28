/// <reference types="vite/client" />

interface Window {
  __annualReportsAnalyticsLoaded?: boolean;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}
