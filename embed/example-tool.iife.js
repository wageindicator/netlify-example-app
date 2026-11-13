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
    ".note { color: #526170; }",
    "details {",
    "  margin-top: 16px;",
    "  border-top: 1px solid #d5dde5;",
    "  padding-top: 12px;",
    "}",
    "summary { cursor: pointer; font-weight: 650; }",
    "dl { margin: 8px 0 12px; }",
    "dt { font-weight: 650; }",
    "dd { margin: 0 0 8px; }",
    "pre {",
    "  margin: 8px 0 12px;",
    "  padding: 12px;",
    "  border-radius: 6px;",
    "  background: #f4f7f9;",
    "  white-space: pre-wrap;",
    "  word-break: break-word;",
    "  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;",
    "  font-size: 0.8125rem;",
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

  class ExampleTool extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._onHashChange = this._onHashChange.bind(this);
      this._requestId = 0;
      this._payload = null;
    }

    static get observedAttributes() {
      return ["heading", "api-base"];
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
        return "Netlify embed example";
      }
      return value;
    }

    _apiBase() {
      return (this.getAttribute("api-base") || "").replace(/\/+$/, "");
    }

    _exampleUrl() {
      return this._apiBase() + "/api/example";
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

      add(tool, "h2", this._heading());

      if (!this._payload) {
        add(tool, "p", "Loading…", "note");
        this._load();
        return;
      }

      add(tool, "p", this._payload.message);
      this._renderSettings(tool);
    }

    _renderSettings(tool) {
      var details = document.createElement("details");
      var payload = this._payload;
      var received = null;
      var attributes = payload.attributes || [];
      var index = 0;

      if (window.location.hash.replace(/^#/, "") === "settings") {
        details.open = true;
      }

      add(details, "summary", "Embed configuration");
      add(details, "p", "Boilerplate only. A real tool leaves this panel out.", "note");

      received = add(details, "dl");
      this._pair(received, "heading", this._heading());
      this._pair(received, "api-base", this._apiBase() || "(same origin)");
      add(details, "pre", this._snippet());

      for (index = 0; index < attributes.length; index += 1) {
        add(
          details,
          "p",
          attributes[index].name + ": " + attributes[index].purpose
        );
      }

      this._renderCms(details, payload.cms);
      tool.appendChild(details);
    }

    _renderCms(details, cms) {
      var fields = (cms && cms.fields) || [];
      var index = 0;
      var field = null;

      add(details, "h3", "What the CMS needs");
      if (!cms) {
        return;
      }
      add(details, "p", cms.summary);
      for (index = 0; index < fields.length; index += 1) {
        field = fields[index];
        add(details, "p", field.name + " — " + field.value + ". " + field.purpose);
      }
      if (cms.markup) {
        add(details, "pre", cms.markup);
      }
    }

    _pair(list, name, value) {
      add(list, "dt", name);
      add(list, "dd", value);
    }

    _snippet() {
      return [
        '<script src="' + this._apiBase() + '/embed/example-tool.iife.js"></script>',
        "<" + ELEMENT_NAME,
        '  heading="' + this._heading() + '"',
        '  api-base="' + this._apiBase() + '"',
        "></" + ELEMENT_NAME + ">",
      ].join("\n");
    }

    _load() {
      var requestId = ++this._requestId;
      var self = this;

      fetch(this._exampleUrl(), { credentials: "omit" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Example API returned status " + response.status);
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

  customElements.define(ELEMENT_NAME, ExampleTool);
})();
