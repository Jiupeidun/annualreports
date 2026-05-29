function idle(callback: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(() => callback());
    return () => window.cancelIdleCallback?.(id);
  }

  const id = globalThis.setTimeout(callback, 1200);
  return () => globalThis.clearTimeout(id);
}

export function startAnalytics(): () => void {
  if (window.__annualReportsAnalyticsLoaded) {
    return () => {};
  }

  let cancelled = false;
  const cancelIdle = idle(() => {
    if (cancelled || window.__annualReportsAnalyticsLoaded) {
      return;
    }

    window.__annualReportsAnalyticsLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-VMYN05WBBT";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", "G-VMYN05WBBT");
  });

  return () => {
    cancelled = true;
    cancelIdle();
  };
}
