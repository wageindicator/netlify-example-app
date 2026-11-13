import { corsHeaders } from "../lib/cors.mjs";

const BODY = JSON.stringify({
  ok: true,
  source: "wageindicator-example-tool",
});

export default async function handler(request) {
  const headers = corsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  headers.set("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ ok: false }), {
      status: 405,
      headers,
    });
  }

  return new Response(BODY, { status: 200, headers });
}
