// Echo Access-Control-Allow-Origin only for WageIndicator and local dev origins.
// Public JSON only: never send credentials.

function isAllowedOrigin(origin) {
  if (!origin || origin === "null") {
    return false;
  }

  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.username || url.password || url.search || url.hash) {
    return false;
  }
  if (url.pathname !== "/" && url.pathname !== "") {
    return false;
  }

  const host = url.hostname;

  if (url.protocol === "http:" && (host === "localhost" || host === "127.0.0.1")) {
    return true;
  }

  if (url.protocol !== "https:") {
    return false;
  }
  if (host === "wageindicator.org") {
    return true;
  }

  const suffix = ".wageindicator.org";
  if (!host.endsWith(suffix)) {
    return false;
  }
  const prefix = host.slice(0, -suffix.length);
  return prefix.length > 0 && !prefix.endsWith(".");
}

export function corsHeaders(request) {
  const headers = new Headers();
  headers.set("Vary", "Origin");

  const origin = request.headers.get("Origin");
  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}
