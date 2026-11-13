import { corsHeaders } from "../lib/cors.mjs";

const BODY = JSON.stringify({
  ok: true,
  message: "Shows how a page embeds a tool hosted on Netlify.",
  element: "wageindicator-example-tool",
  scriptPath: "/embed/example-tool.iife.js",
  attributes: [
    {
      name: "heading",
      purpose: "Title inside the tool. Defaults to Netlify embed example.",
    },
    {
      name: "api-base",
      purpose:
        "Origin of this Netlify site, with no path. Empty means the current origin.",
    },
  ],
  cms: {
    summary:
      "One Web component page. Set the script URL, the element name, an optional API origin, and extra attributes.",
    fields: [
      {
        name: "component_url",
        value:
          "https://wageindicator-example-tool.netlify.app/embed/example-tool.iife.js",
        purpose: "Classic IIFE script. A path is allowed. No userinfo, query, or fragment.",
      },
      {
        name: "element_name",
        value: "wageindicator-example-tool",
        purpose: "Custom element tag. It must contain a hyphen.",
      },
      {
        name: "api_base",
        value: "https://wageindicator-example-tool.netlify.app",
        purpose:
          "Optional origin, rendered as api-base. No path. Leave it empty to omit the attribute.",
      },
      {
        name: "parameters",
        value: "heading",
        purpose: "Extra attributes. heading is the title inside the tool.",
      },
    ],
    markup: [
      '<script src="https://wageindicator-example-tool.netlify.app/embed/example-tool.iife.js"></script>',
      "<wageindicator-example-tool",
      '  heading="Netlify embed example"',
      '  api-base="https://wageindicator-example-tool.netlify.app"',
      "></wageindicator-example-tool>",
    ].join("\n"),
  },
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
