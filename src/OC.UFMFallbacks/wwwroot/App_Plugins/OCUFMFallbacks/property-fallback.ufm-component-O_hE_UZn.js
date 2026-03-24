import { UmbUfmComponentBase as P } from "@umbraco-cms/backoffice/ufm";
import { property as m, state as d, customElement as x, html as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as F } from "@umbraco-cms/backoffice/lit-element";
import { UmbContextToken as O } from "@umbraco-cms/backoffice/context-api";
var U = Object.defineProperty, w = Object.getOwnPropertyDescriptor, u = (e, r, t, s) => {
  for (var n = s > 1 ? void 0 : s ? w(r, t) : r, l = e.length - 1, o; l >= 0; l--)
    (o = e[l]) && (n = (s ? o(r, t, n) : o(n)) || n);
  return s && n && U(r, t, n), n;
};
const C = new O("UmbUfmRenderContext");
let p = class extends F {
  constructor() {
    super(), this.consumeContext(C, (e) => {
      this.observe(e?.value, (r) => {
        this._blockData = r, this._processPropertyFallback();
      }, "observeValue");
    });
  }
  _processPropertyFallback() {
    if (!this._blockData || !this.primaryProperty) return;
    let e = this._getPropertyValue(this._blockData, this.primaryProperty);
    if (!e && this.fallbackProperties) {
      const r = this.fallbackProperties.split(",").map((t) => t.trim()).filter((t) => t);
      for (const t of r)
        if (e = this._getPropertyValue(this._blockData, t), e) break;
    }
    if (e && this.filters)
      try {
        const r = JSON.parse(this.filters);
        e = this._applyFilters(e, r);
      } catch (r) {
        console.error("[OcPropertyFallbackElement] Error parsing filters:", r);
      }
    this._value = e || "";
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getPropertyValue(e, r) {
    if (!e || !r) return null;
    let t = e[r];
    if (t && typeof t == "object" && t.markup !== void 0 && (t = t.markup), t == null) return null;
    if (Array.isArray(t))
      return t.length === 0 ? null : JSON.stringify(t);
    if (typeof t == "object" && t !== null) {
      if (Array.isArray(t.contentData) && t.contentData.length > 0)
        return JSON.stringify(t.contentData);
      if (Array.isArray(t.blocks) && t.blocks.length > 0)
        return JSON.stringify(t.blocks);
      if (Array.isArray(t.items) && t.items.length > 0)
        return JSON.stringify(t.items);
      try {
        return JSON.stringify(t);
      } catch {
      }
    }
    const s = String(t).trim();
    return s.length === 0 ? null : s.startsWith("<") ? s.replace(/<[^>]*>/g, "").trim().length > 0 ? s : null : s;
  }
  _applyFilters(e, r) {
    let t = e;
    for (const s of r)
      t = this._applySingleFilter(t, s);
    return t;
  }
  _applySingleFilter(e, r) {
    switch (r.name.toLowerCase()) {
      case "truncate":
        return this._truncate(e, r.params);
      case "striphtml":
      case "ncrichtext":
        return this._stripHtml(e);
      case "uppercase":
        return e.toUpperCase();
      case "lowercase":
        return e.toLowerCase();
      case "wordlimit":
        return this._wordLimit(e, r.params);
      case "count":
      case "arraycount":
        return this._arrayCount(e, r.params);
      default:
        return console.warn("[OcPropertyFallbackElement] Unknown filter:", r.name), e;
    }
  }
  _truncate(e, r) {
    const t = r.length > 0 ? parseInt(r[0], 10) : 100;
    if (e.length <= t) return e;
    const s = e.substring(0, t), n = s.lastIndexOf(" ");
    return n > 0 && n > t * 0.8 ? s.substring(0, n) + "..." : s + "...";
  }
  _stripHtml(e) {
    return e.replace(/<[^>]*>/g, "").trim();
  }
  _wordLimit(e, r) {
    const t = r.length > 0 ? parseInt(r[0], 10) : 10, s = e.split(/\s+/);
    return s.length <= t ? e : s.slice(0, t).join(" ") + "...";
  }
  _arrayCount(e, r) {
    try {
      const t = JSON.parse(e);
      if (Array.isArray(t)) {
        const s = t.length;
        if (r.length >= 2) {
          const n = r[0], l = r[1];
          return `${s} ${s === 1 ? n : l}`;
        }
        return r.length === 1 ? `${s} ${r[0]}` : String(s);
      }
    } catch {
    }
    return e;
  }
  render() {
    return this._value === void 0 ? h`<span class="ufm-property-fallback loading">...</span>` : this._value ? h`<span class="ufm-property-fallback">${this._value}</span>` : h`<span class="ufm-property-fallback empty"></span>`;
  }
};
u([
  m({ attribute: "expression" })
], p.prototype, "expression", 2);
u([
  m({ attribute: "primary-property" })
], p.prototype, "primaryProperty", 2);
u([
  m({ attribute: "fallback-properties" })
], p.prototype, "fallbackProperties", 2);
u([
  m({ attribute: "filters" })
], p.prototype, "filters", 2);
u([
  d()
], p.prototype, "_value", 2);
p = u([
  x("ufm-oc-property-fallback")
], p);
class D extends P {
  constructor() {
    super(...arguments), this.render = (r) => {
      if (!r.text) return;
      console.log("[PropertyFallbackUfm] render() called, token.text:", r.text);
      const t = this.parseExpression(r.text);
      if (!t) {
        console.warn("[PropertyFallbackUfm] Failed to parse expression:", r.text);
        return;
      }
      const s = `<ufm-oc-property-fallback 
      expression="${this.escapeHtml(r.text)}"
      primary-property="${t.primary}"
      fallback-properties="${t.fallbacks.join(",")}"
      filters="${this.escapeHtml(this.encodeFilters(t.filters))}">
    </ufm-oc-property-fallback>`;
      return console.log("[PropertyFallbackUfm] returning:", s), s;
    }, this.parseExpression = (r) => {
      try {
        const t = r.split("||").map((i) => i.trim()), s = t[0], n = t.slice(1);
        let l = [], o = n.length > 0 ? n[n.length - 1] : s;
        if (o.includes("|")) {
          const i = o.split("|").map((c) => c.trim()), g = i[0];
          l = i.slice(1).map((c) => {
            const y = c.indexOf(":");
            if (y === -1)
              return { name: c.trim(), params: [] };
            const b = c.substring(0, y).trim(), _ = c.substring(y + 1).split(",").map((k) => k.trim());
            return { name: b, params: _ };
          }), n.length > 0 ? n[n.length - 1] = g : t[0] = g;
        }
        let f = s;
        f.includes("|") && (f = f.split("|")[0].trim());
        let a = n;
        if (a.length > 0 && a[a.length - 1].includes("|")) {
          const i = a[a.length - 1].split("|")[0].trim();
          a = [...a.slice(0, -1), i];
        }
        return {
          primary: f,
          fallbacks: a.filter((i) => i.length > 0),
          filters: l
        };
      } catch (t) {
        return console.error("[PropertyFallbackUfm] Error parsing expression:", r, t), null;
      }
    }, this.escapeHtml = (r) => r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"), this.encodeFilters = (r) => JSON.stringify(r);
  }
}
export {
  D as PropertyFallbackUfmComponent,
  D as api
};
//# sourceMappingURL=property-fallback.ufm-component-O_hE_UZn.js.map
