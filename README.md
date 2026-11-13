# Netlify embed example

Example of a tool hosted on Netlify and embedded on a page. The tool shows a title and one line that says what it is for. Open **Embed configuration** inside the tool for the attributes and the CMS fields.

## What the CMS needs

Wagtail has one page for every hosted custom element: **Web component** (`apps.external.web_component`). Editors set the script URL, the element name, an optional API origin, and extra attributes. There is no model per Netlify app, and no component URL setting.

For this tool:

- **Script URL** (`component_url`): `https://wageindicator-example-tool.netlify.app/embed/example-tool.iife.js`
- **Element name** (`element_name`): `wageindicator-example-tool`
- **API origin** (`api_base`): `https://wageindicator-example-tool.netlify.app`
- **Extra attributes** (`parameters`): `heading` is the title inside the tool

`component_url` is a classic IIFE `<script src>`. A path is allowed. No userinfo, query, or fragment.

`element_name` is the custom element tag and must contain a hyphen. It is the tag, not an attribute.

`api_base` is an optional origin with no path. The page renders it as `api-base`. Leave it empty and the attribute is omitted, so the component calls its own origin. Set it on another site. Leave it empty on this site so `/api/example` stays same-origin.

`parameters` are ordered name/value pairs, unique per page, rendered as attributes. Reserved names are `api-base`, `src`, `href`, and any name that starts with `on`.

Both URL fields accept `https` only, except `http` on `localhost` and `127.0.0.1`. The host must be `wageindicator.org`, a subdomain, or a host ending in `.netlify.app`.

The page can sit under a site, a subsite, or a content page. It returns the HTML below. Nuxt injects that HTML and runs the classic script again on client navigation. There is no Vue page for this type.

```html
<script src="https://wageindicator-example-tool.netlify.app/embed/example-tool.iife.js"></script>
<wageindicator-example-tool
  heading="Netlify embed example"
  api-base="https://wageindicator-example-tool.netlify.app"
></wageindicator-example-tool>
```

A real tool navigates with the hash. The document path does not change.

## Roles

GitHub holds the source Netlify builds. Netlify hosts the script and `/api/example`. Wagtail owns the public page and the attributes. Netlify is not the source of the CMS page.

## Files

- `index.html` — host page, the same job the CMS page does
- `embed/example-tool.iife.js` — classic IIFE, shadow DOM, CSS in the file
- `netlify/functions/example.mjs` — placeholder text plus the embed contract
- `netlify/functions/ping.mjs` — health check
- `netlify/lib/cors.mjs` — allow-origin for WageIndicator hosts and localhost
- `netlify.toml` — publish the project root and rewrite `/api/example` and `/api/ping`

## Rules the tool states

1. Keep the current site, its URLs, and its sitemap. Add the embed beside them.
2. Publish one classic IIFE. No ES module and no extra chunks.
3. Register the custom element only if `customElements.get` is empty.
4. Put markup and CSS in a shadow DOM.
5. Pass props as HTML attributes. Prefix API calls with `api-base` on another origin.
6. Navigate with the hash, not the document path.
7. Echo `Access-Control-Allow-Origin` only for `https://wageindicator.org`, its subdomains, and localhost. No cookies. `img` does not need CORS. Keep cookie forms on the Netlify site and link out.
8. Do not use an iframe.
9. On the Web component page, give the script URL, the element name, the API origin, and the extra attributes.
