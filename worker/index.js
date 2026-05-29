const AUTH_PATH = "/__pdf-auth";
const COOKIE_NAME = "annual_reports_pdf_auth";
const SESSION_SECONDS = 12 * 60 * 60;

function isPdfPath(pathname) {
  return pathname.toLowerCase().endsWith(".pdf");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeNextUrl(requestUrl, value) {
  try {
    const candidate = new URL(value || "/", requestUrl);

    if (candidate.origin !== requestUrl.origin || !isPdfPath(candidate.pathname)) {
      return "/";
    }

    return `${candidate.pathname}${candidate.search}`;
  } catch {
    return "/";
  }
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie");

  if (!cookie) {
    return null;
  }

  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return difference === 0;
}

function bytesToBase64Url(bytes) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function createSessionCookie(request, env) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expiresAt);
  const signature = await sign(payload, env.PDF_PASSWORD);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";

  return `${COOKIE_NAME}=${encodeURIComponent(`${payload}.${signature}`)}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${SESSION_SECONDS}`;
}

async function hasValidSession(request, env) {
  const cookie = getCookie(request, COOKIE_NAME);

  if (!cookie) {
    return false;
  }

  const [expiresAt, signature] = cookie.split(".");
  const expiresAtNumber = Number(expiresAt);

  if (!expiresAt || !signature || !Number.isFinite(expiresAtNumber)) {
    return false;
  }

  if (expiresAtNumber <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  return timingSafeEqual(signature, await sign(expiresAt, env.PDF_PASSWORD));
}

function passwordPage(request, next, options = {}) {
  const status = options.status ?? 401;
  const error = options.error ?? "";
  const escapedNext = escapeHtml(next);
  const errorHtml = error ? `<p class="error">${escapeHtml(error)}</p>` : "";

  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Annual Reports - PDF Password</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f3f0ff;
      color: #12172a;
    }

    * { box-sizing: border-box; }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(70% 70% at 20% 20%, rgba(151, 195, 255, .54), transparent 60%),
        radial-gradient(80% 72% at 82% 28%, rgba(210, 174, 255, .62), transparent 64%),
        linear-gradient(135deg, #eef8ff, #eee3ff 52%, #d8c5ff);
    }

    main {
      width: min(100%, 360px);
      display: grid;
      gap: 18px;
    }

    h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 360;
      line-height: 1.2;
      text-align: center;
    }

    form {
      display: grid;
      gap: 14px;
    }

    input,
    button {
      width: 100%;
      min-height: 46px;
      border-radius: 10px;
      font: inherit;
    }

    input {
      border: 1px solid rgba(24, 37, 71, .22);
      padding: 0 14px;
      background: rgba(255, 255, 255, .72);
      color: inherit;
      outline: none;
    }

    input:focus {
      border-color: rgba(67, 90, 180, .58);
    }

    button {
      border: 0;
      background: #18254b;
      color: #fff;
      cursor: pointer;
    }

    .error {
      margin: 0;
      color: #9b1c31;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>
  <main>
    <h1>Annual Reports</h1>
    ${errorHtml}
    <form method="post" action="${AUTH_PATH}">
      <input type="hidden" name="next" value="${escapedNext}">
      <input name="password" type="password" autocomplete="current-password" placeholder="Password" autofocus required>
      <button type="submit">Open PDF</button>
    </form>
  </main>
</body>
</html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  });
}

async function serveProtectedPdf(request, env) {
  const requestUrl = new URL(request.url);

  if (!env.PDF_PASSWORD) {
    return new Response("PDF password is not configured.", {
      status: 500,
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (!(await hasValidSession(request, env))) {
    return passwordPage(request, `${requestUrl.pathname}${requestUrl.search}`);
  }

  const assetResponse = await env.ASSETS.fetch(request);
  const response = new Response(assetResponse.body, assetResponse);

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}

async function handlePasswordSubmit(request, env) {
  const requestUrl = new URL(request.url);

  if (!env.PDF_PASSWORD) {
    return new Response("PDF password is not configured.", {
      status: 500,
      headers: { "Cache-Control": "no-store" }
    });
  }

  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = safeNextUrl(requestUrl, String(form.get("next") ?? "/"));

  if (!timingSafeEqual(password, env.PDF_PASSWORD)) {
    return passwordPage(request, next, {
      status: 401,
      error: "Incorrect password."
    });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: next,
      "Set-Cookie": await createSessionCookie(request, env),
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === AUTH_PATH && request.method === "POST") {
      return handlePasswordSubmit(request, env);
    }

    if (isPdfPath(url.pathname)) {
      return serveProtectedPdf(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
