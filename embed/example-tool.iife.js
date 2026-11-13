// Classic script (not a module). One file, no imports, no chunks.
// Relative URLs in a classic script resolve against the CMS origin, so API
// calls go through the api-base attribute when this runs on another host.
(function () {
  var ELEMENT_NAME = "wageindicator-example-tool";

  // The CMS re-inserts this script on client navigation. Defining twice throws.
  if (customElements.get(ELEMENT_NAME)) {
    return;
  }

  var CSS = [
    ":host {",
    "  display: block;",
    "  color: #14202b;",
    "  font-family: system-ui, sans-serif;",
    "  font-size: 16px;",
    "  line-height: 1.5;",
    "}",
    ".tool {",
    "  border: 1px solid #d5dde5;",
    "  border-radius: 8px;",
    "  background: #fff;",
    "  padding: 20px;",
    "}",
    "h2, h3 {",
    "  margin: 0 0 8px;",
    "  font-weight: 650;",
    "  line-height: 1.3;",
    "}",
    "h2 { font-size: 1.35rem; }",
    "h3 { font-size: 1rem; margin-top: 20px; }",
    "p, li { margin: 0 0 8px; }",
    ".disclaimer {",
    "  color: #526170;",
    "  font-size: 0.875rem;",
    "}",
    ".countries, .figures {",
    "  display: grid;",
    "  gap: 8px;",
    "  margin: 12px 0;",
    "  padding: 0;",
    "  list-style: none;",
    "}",
    ".countries { grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); }",
    ".country, .figure {",
    "  border: 1px solid #d5dde5;",
    "  border-radius: 6px;",
    "  background: #f7fafc;",
    "  padding: 12px;",
    "}",
    ".country {",
    "  font: inherit;",
    "  color: inherit;",
    "  text-align: left;",
    "  cursor: pointer;",
    "}",
    ".country strong, .figure strong { display: block; }",
    ".country span, .figure span, .meta {",
    "  color: #526170;",
    "  font-size: 0.875rem;",
    "}",
    ".actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }",
    "button {",
    "  font: inherit;",
    "  padding: 8px 12px;",
    "  border-radius: 6px;",
    "  border: 1px solid #1f4e79;",
    "  background: #1f4e79;",
    "  color: #fff;",
    "  cursor: pointer;",
    "}",
    "button.secondary { background: #fff; color: #1f4e79; }",
    "button:focus-visible { outline: 2px solid #14202b; outline-offset: 2px; }",
    "details {",
    "  margin-top: 16px;",
    "  border-top: 1px solid #d5dde5;",
    "  padding-top: 12px;",
    "}",
    "summary { cursor: pointer; font-weight: 650; }",
    "dl { margin: 8px 0 12px; }",
    "dt { font-weight: 650; }",
    "dd { margin: 0 0 8px; color: #24323d; }",
    "pre, code {",
    "  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;",
    "  font-size: 0.8125rem;",
    "}",
    "pre {",
    "  margin: 8px 0 12px;",
    "  padding: 12px;",
    "  border-radius: 6px;",
    "  background: #f4f7f9;",
    "  white-space: pre-wrap;",
    "  word-break: break-word;",
    "}",
    ".error { color: #8a1f1f; }",
  ].join("\n");

  function add(parent, tag, text, className) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text != null) {
      node.textContent = text;
    }
    parent.appendChild(node);
    return node;
  }

  function button(parent, label, hash, secondary) {
    var node = add(parent, "button", label, secondary ? "secondary" : "");
    node.type = "button";
    node.addEventListener("click", function () {
      window.location.hash = hash;
    });
    return node;
  }

  class WageIndicatorExampleTool extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._onHashChange = this._onHashChange.bind(this);
      this._requestId = 0;
      this._payload = null;
    }

    static get observedAttributes() {
      return ["heading", "api-base", "country"];
    }

    connectedCallback() {
      window.addEventListener("hashchange", this._onHashChange);
      this._render();
    }

    disconnectedCallback() {
      window.removeEventListener("hashchange", this._onHashChange);
      this._requestId += 1;
    }

    attributeChangedCallback() {
      if (this.isConnected) {
        this._render();
      }
    }

    _onHashChange() {
      this._render();
    }

    _heading() {
      var value = this.getAttribute("heading");
      if (value === null || value === "") {
        return "Sample wages";
      }
      return value;
    }

    _countryAttribute() {
      return (this.getAttribute("country") || "").trim().toUpperCase();
    }

    _apiBase() {
      return (this.getAttribute("api-base") || "").replace(/\/+$/, "");
    }

    _wagesUrl() {
      return this._apiBase() + "/api/wages";
    }

    _hashToken() {
      return window.location.hash.replace(/^#/, "").trim();
    }

    _view() {
      var token = this._hashToken().toLowerCase();
      if (!token) {
        return this._countryAttribute() ? "country" : "overview";
      }
      if (token === "overview") {
        return "overview";
      }
      if (token === "settings") {
        return "settings";
      }
      return "country";
    }

    _selectedCode() {
      var token = this._hashToken().toUpperCase();
      if (token && token !== "OVERVIEW" && token !== "SETTINGS") {
        return token;
      }
      if (!this._hashToken() && this._countryAttribute()) {
        return this._countryAttribute();
      }
      return "";
    }

    _countryByCode(code) {
      var countries = (this._payload && this._payload.countries) || [];
      var wanted = (code || "").toUpperCase();
      for (var i = 0; i < countries.length; i += 1) {
        if (countries[i].code === wanted) {
          return countries[i];
        }
      }
      return null;
    }

    _render() {
      var root = this.shadowRoot;
      var style = document.createElement("style");
      var tool = document.createElement("div");

      root.replaceChildren();
      style.textContent = CSS;
      tool.className = "tool";
      root.appendChild(style);
      root.appendChild(tool);

      if (!this._payload) {
        add(tool, "h2", this._heading());
        add(tool, "p", "Loading sample wages…", "disclaimer");
        this._load();
        return;
      }

      if (this._view() === "country") {
        this._renderCountry(tool);
      } else {
        this._renderOverview(tool);
      }
      this._renderSettings(tool, this._view() === "settings");
    }

    _renderOverview(tool) {
      var countries = this._payload.countries || [];
      var list = null;
      var actions = null;
      var index = 0;
      var country = null;
      var self = this;

      add(tool, "h2", this._heading());
      add(tool, "p", this._payload.disclaimer, "disclaimer");
      add(
        tool,
        "p",
        "Pick a country to see a sample minimum wage and living wage. These two figures are what a WageIndicator tool is asked for."
      );
      list = add(tool, "div", null, "countries");
      for (index = 0; index < countries.length; index += 1) {
        country = countries[index];
        this._countryButton(list, country);
      }
      actions = add(tool, "div", null, "actions");
      button(actions, "Embed settings", "settings", true);
      if (self._countryAttribute()) {
        add(
          tool,
          "p",
          "The CMS passed country " + self._countryAttribute() + ".",
          "meta"
        );
      }
    }

    _countryButton(list, country) {
      var node = document.createElement("button");
      node.type = "button";
      node.className = "country";
      add(node, "strong", country.name);
      add(
        node,
        "span",
        "Minimum " +
          country.currency +
          " " +
          country.minimum.amount +
          " " +
          country.minimum.period
      );
      node.addEventListener("click", function () {
        window.location.hash = country.code;
      });
      list.appendChild(node);
    }

    _renderCountry(tool) {
      var country = this._countryByCode(this._selectedCode());
      var actions = null;
      var figures = null;

      if (!country) {
        add(tool, "h2", "Country not in the sample");
        add(
          tool,
          "p",
          "No sample wages for " + (this._selectedCode() || "this code") + "."
        );
        actions = add(tool, "div", null, "actions");
        button(actions, "All sample countries", "overview", true);
        return;
      }

      add(tool, "h2", country.name);
      add(tool, "p", country.situation, "disclaimer");
      figures = add(tool, "div", null, "figures");
      this._figure(
        figures,
        "Minimum wage",
        country.currency + " " + country.minimum.amount,
        country.minimum.period
      );
      this._figure(
        figures,
        "Living wage",
        country.currency + " " + country.living.amount,
        country.living.period
      );
      add(tool, "p", this._payload.disclaimer, "disclaimer");
      actions = add(tool, "div", null, "actions");
      button(actions, "All sample countries", "overview", true);
      button(actions, "Embed settings", "settings", true);
    }

    _figure(parent, label, amount, period) {
      var item = add(parent, "div", null, "figure");
      add(item, "span", label);
      add(item, "strong", amount);
      add(item, "span", period);
    }

    _renderSettings(tool, open) {
      var details = document.createElement("details");
      var payload = this._payload;
      var roles = payload.roles || [];
      var attributes = payload.attributes || [];
      var requirements = payload.requirements || [];
      var index = 0;
      var list = null;
      var received = null;

      if (open) {
        details.open = true;
      }
      add(details, "summary", "Embed configuration");
      add(
        details,
        "p",
        "This block is the contract. A real WageIndicator tool follows the same shape and leaves this explanation out.",
        "disclaimer"
      );

      add(details, "h3", "What this instance received");
      received = add(details, "dl");
      this._pair(received, "heading", this._heading());
      this._pair(received, "api-base", this._apiBase() || "(same origin)");
      this._pair(received, "country", this._countryAttribute() || "(not set)");
      this._pair(received, "API", this._wagesUrl());
      this._pair(received, "hash", window.location.hash || "(empty)");

      add(details, "h3", "Who owns what");
      for (index = 0; index < roles.length; index += 1) {
        add(details, "p", roles[index].name + ": " + roles[index].job);
      }

      add(details, "h3", "Attributes");
      for (index = 0; index < attributes.length; index += 1) {
        add(
          details,
          "p",
          attributes[index].name +
            " (" +
            attributes[index].required +
            "): " +
            attributes[index].purpose
        );
      }

      add(details, "h3", "What the CMS needs");
      add(
        details,
        "p",
        "Script URL, element name, and attribute list. For this tool that is " +
          this._apiBase() +
          payload.scriptPath +
          ", " +
          payload.element +
          ", and heading, api-base, country."
      );
      add(details, "pre", this._snippet());

      add(details, "h3", "Rules for another app");
      list = document.createElement("ol");
      details.appendChild(list);
      for (index = 0; index < requirements.length; index += 1) {
        add(list, "li", requirements[index]);
      }

      tool.appendChild(details);
    }

    _pair(list, name, value) {
      add(list, "dt", name);
      add(list, "dd", value);
    }

    _snippet() {
      var lines = [
        '<script src="' + this._apiBase() + '/embed/example-tool.iife.js"></script>',
        "<wageindicator-example-tool",
        '  heading="' + this._heading() + '"',
        '  api-base="' + this._apiBase() + '"',
      ];
      if (this._countryAttribute()) {
        lines.push('  country="' + this._countryAttribute() + '"');
      }
      lines.push("></wageindicator-example-tool>");
      return lines.join("\n");
    }

    _load() {
      var requestId = ++this._requestId;
      var self = this;

      fetch(this._wagesUrl(), { credentials: "omit" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Sample wages returned status " + response.status);
          }
          return response.json();
        })
        .then(function (payload) {
          if (requestId !== self._requestId) {
            return;
          }
          self._payload = payload;
          self._render();
        })
        .catch(function (error) {
          if (requestId !== self._requestId || !self.shadowRoot) {
            return;
          }
          var tool = self.shadowRoot.querySelector(".tool");
          if (!tool) {
            return;
          }
          add(
            tool,
            "p",
            "Error: " + (error && error.message ? error.message : "Request failed"),
            "error"
          );
        });
    }
  }

  customElements.define(ELEMENT_NAME, WageIndicatorExampleTool);
})();
