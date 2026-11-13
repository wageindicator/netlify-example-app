import { corsHeaders } from "../lib/cors.mjs";

// Illustrative figures for the reference tool. Not WageIndicator estimates.
const BODY = JSON.stringify({
  ok: true,
  disclaimer:
    "Sample figures for this reference tool. They are not WageIndicator minimum-wage or living-wage estimates.",
  element: "wageindicator-example-tool",
  scriptPath: "/embed/example-tool.iife.js",
  roles: [
    {
      name: "GitLab",
      job: "Holds the source and the review.",
    },
    {
      name: "Netlify",
      job: "Hosts this script and /api/wages. It is not the CMS page.",
    },
    {
      name: "Wagtail",
      job: "Owns the public URL, title, menu, and the attributes on the element.",
    },
  ],
  attributes: [
    {
      name: "heading",
      required: "optional",
      purpose: "Title shown in the tool. Defaults to Sample wages. The CMS passes the page title.",
    },
    {
      name: "api-base",
      required: "required on another origin",
      purpose:
        "Origin of this Netlify site, with no path. The tool prefixes /api/wages with it. Empty means the current origin.",
    },
    {
      name: "country",
      required: "optional",
      purpose:
        "ISO 3166-1 alpha-2 code. When the CMS sets it and the hash is empty, the tool opens that country, the same way a country page scopes a WageIndicator tool.",
    },
  ],
  requirements: [
    "Ship one classic IIFE. Do not use an ES module and do not emit extra chunks. A classic script resolves relative URLs against the CMS page.",
    "Register the custom element only when customElements.get does not already return it. The CMS inserts the script again on client navigation.",
    "Keep markup and CSS in a shadow DOM, inside the same file.",
    "Pass props as HTML attributes.",
    "Keep navigation in the hash. Do not change the document path. This tool uses #overview, #settings, and #NL.",
    "On public JSON, echo Access-Control-Allow-Origin only for https://wageindicator.org, its subdomains, and localhost. Do not send cookies.",
    "Do not use an iframe.",
  ],
  countries: [
    {
      code: "NL",
      name: "Netherlands",
      currency: "EUR",
      minimum: { amount: "15.00", period: "per hour" },
      living: { amount: "18.00", period: "per hour" },
      situation: "Sample full-time employee, paid by the hour.",
    },
    {
      code: "IN",
      name: "India",
      currency: "INR",
      minimum: { amount: "180", period: "per day" },
      living: { amount: "260", period: "per day" },
      situation: "Sample day-rated worker in a service job.",
    },
    {
      code: "KE",
      name: "Kenya",
      currency: "KES",
      minimum: { amount: "15000", period: "per month" },
      living: { amount: "22000", period: "per month" },
      situation: "Sample monthly-paid employee.",
    },
    {
      code: "BR",
      name: "Brazil",
      currency: "BRL",
      minimum: { amount: "1500", period: "per month" },
      living: { amount: "2100", period: "per month" },
      situation: "Sample monthly-paid employee.",
    },
  ],
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
