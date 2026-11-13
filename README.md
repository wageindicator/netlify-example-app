# Sample wages

Reference WageIndicator tool. It shows a minimum wage and a living wage for a few countries, and it describes the embed contract in the tool itself. The figures are samples, not WageIndicator estimates.

Open the site and use **Embed settings** inside the tool. That panel is the specification: the attributes this instance received, who owns the source, the host, and the page, and the rules another app must follow.

## What the CMS needs

- Script URL: `https://wageindicator-example-tool.netlify.app/embed/example-tool.iife.js`
- Custom element: `wageindicator-example-tool`
- Attributes: `heading`, `api-base`, `country`

`heading` is the title. It defaults to `Sample wages`. The CMS passes the page title.

`api-base` is the Netlify origin with no path. Set it when the script runs on wageindicator.org. Leave it empty on this site so `/api/wages` stays same-origin.

`country` is an optional ISO 3166-1 alpha-2 code. When the hash is empty, the tool opens that country. This is how a country page scopes a WageIndicator tool.

```html
<script src="https://wageindicator-example-tool.netlify.app/embed/example-tool.iife.js"></script>
<wageindicator-example-tool
  heading="Sample wages"
  api-base="https://wageindicator-example-tool.netlify.app"
  country="NL"
></wageindicator-example-tool>
```

Views use the hash only: `#overview`, `#settings`, and a country code such as `#NL`. The document path does not change.

## Roles

GitLab holds the source. Netlify hosts the script and `/api/wages`. Wagtail owns the public page and the attributes. Netlify is not the source of the CMS page.

## Files

- `index.html` — host page, the same job the CMS page does
- `embed/example-tool.iife.js` — classic IIFE, shadow DOM, CSS in the file
- `netlify/functions/wages.mjs` — sample countries plus the embed contract
- `netlify/functions/ping.mjs` — health check
- `netlify/lib/cors.mjs` — allow-origin for WageIndicator hosts and localhost
- `netlify.toml` — publish the project root and rewrite `/api/wages` and `/api/ping`

## Rules the tool states

1. Keep the current site, its URLs, and its sitemap. Add the embed beside them.
2. Publish one classic IIFE. No ES module and no extra chunks.
3. Register the custom element only if `customElements.get` is empty.
4. Put markup and CSS in a shadow DOM.
5. Pass props as HTML attributes. Prefix API calls with `api-base` on another origin.
6. Navigate with the hash, not the document path.
7. Echo `Access-Control-Allow-Origin` only for `https://wageindicator.org`, its subdomains, and localhost. No cookies. `img` does not need CORS. Keep cookie forms on the Netlify site and link out.
8. Do not use an iframe.
9. Give the CMS the script URL, the element name, and the attribute list.
