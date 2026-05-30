import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve("dist");
const cloudflareOrigin = "https://annualreports.kkertin1214.workers.dev";
const githubPagesBase = "/annualreports";

const redirectHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Annual Reports</title>
  <script>
    (() => {
      const cloudflareOrigin = "${cloudflareOrigin}";
      const githubPagesBase = "${githubPagesBase}";
      const target = new URL(cloudflareOrigin);
      const strippedPath = location.pathname.startsWith(githubPagesBase)
        ? location.pathname.slice(githubPagesBase.length)
        : location.pathname;

      target.pathname = strippedPath === "" || strippedPath === "/" || strippedPath === "/index.html"
        ? "/"
        : strippedPath;
      target.search = location.search;
      target.hash = location.hash;
      location.replace(target.href);
    })();
  </script>
  <style>
    :root {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #111827;
      background: #f8fbff;
    }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    a {
      color: inherit;
    }
  </style>
</head>
<body>
  <p>Redirecting to <a href="${cloudflareOrigin}/">Annual Reports</a>.</p>
</body>
</html>
`;

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await writeFile(resolve(distDir, "index.html"), redirectHtml);
await writeFile(resolve(distDir, "404.html"), redirectHtml);
