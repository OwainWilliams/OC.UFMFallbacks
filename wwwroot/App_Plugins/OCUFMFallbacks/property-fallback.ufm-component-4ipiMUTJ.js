import { UmbUfmComponentBase as d } from "@umbraco-cms/backoffice/ufm";
import { property as f, state as k, customElement as x, html as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as F } from "@umbraco-cms/backoffice/lit-element";
import { UmbContextToken as U } from "@umbraco-cms/backoffice/context-api";
var w = Object.defineProperty, v = Object.getOwnPropertyDescriptor, m = (e, t, r, s) => {
  for (var l = s > 1 ? void 0 : s ? v(t, r) : t, o = e.length - 1, p; o >= 0; o--)
    (p = e[o]) && (l = (s ? p(t, r, l) : p(l)) || l);
  return s && l && w(t, r, l), l;
};
const E = new U("UmbUfmRenderContext");
let i = class extends F {
  constructor() {
    super(), this.consumeContext(E, (e) => {
      this.observe(e?.value, (t) => {
        this._blockData = t, this._processPropertyFallback();
      }, "observeValue");
    });
  }
  _processPropertyFallback() {
    if (!this._blockData || !this.primaryProperty) return;
    let e = this._getPropertyValue(this._blockData, this.primaryProperty);
    if (!e && this.fallbackProperties) {
      const t = this.fallbackProperties.split(",").map((r) => r.trim()).filter((r) => r);
      for (const r of t)
        if (e = this._getPropertyValue(this._blockData, r), e) break;
    }
    if (e && this.filters)
      try {
        const t = JSON.parse(this.filters);
        e = this._applyFilters(e, t);
      } catch (t) {
        console.error("[OcPropertyFallbackElement] Error parsing filters:", t);
      }
    this._value = e || "";
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getPropertyValue(e, t) {
    if (!e || !t) return null;
    let r = e[t];
    if (r && typeof r == "object" && r.markup !== void 0 && (r = r.markup), r == null) return null;
    const s = String(r).trim();
    return s.length === 0 ? null : s.startsWith("<") ? s.replace(/<[^>]*>/g, "").trim().length > 0 ? s : null : s;
  }
  _applyFilters(e, t) {
    let r = e;
    for (const s of t)
      r = this._applySingleFilter(r, s);
    return r;
  }
  _applySingleFilter(e, t) {
    switch (t.name.toLowerCase()) {
      case "truncate":
        return this._truncate(e, t.params);
      case "striphtml":
      case "ncrichtext":
        return this._stripHtml(e);
      case "uppercase":
        return e.toUpperCase();
      case "lowercase":
        return e.toLowerCase();
      case "wordlimit":
        return this._wordLimit(e, t.params);
      default:
        return console.warn("[OcPropertyFallbackElement] Unknown filter:", t.name), e;
    }
  }
  _truncate(e, t) {
    const r = t.length > 0 ? parseInt(t[0], 10) : 100;
    if (e.length <= r) return e;
    const s = e.substring(0, r), l = s.lastIndexOf(" ");
    return l > 0 && l > r * 0.8 ? s.substring(0, l) + "..." : s + "...";
  }
  _stripHtml(e) {
    return e.replace(/<[^>]*>/g, "").trim();
  }
  _wordLimit(e, t) {
    const r = t.length > 0 ? parseInt(t[0], 10) : 10, s = e.split(/\s+/);
    return s.length <= r ? e : s.slice(0, r).join(" ") + "...";
  }
  render() {
    return this._value === void 0 ? b`<span class="ufm-property-fallback loading">...</span>` : this._value ? b`<span class="ufm-property-fallback">${this._value}</span>` : b`<span class="ufm-property-fallback empty"></span>`;
  }
};
m([
  f({ attribute: "expression" })
], i.prototype, "expression", 2);
m([
  f({ attribute: "primary-property" })
], i.prototype, "primaryProperty", 2);
m([
  f({ attribute: "fallback-properties" })
], i.prototype, "fallbackProperties", 2);
m([
  f({ attribute: "filters" })
], i.prototype, "filters", 2);
m([
  k()
], i.prototype, "_value", 2);
i = m([
  x("ufm-oc-property-fallback")
], i);
class L extends d {
  constructor() {
    super(...arguments), this.render = (t) => {
      if (!t.text) return;
      console.log("[PropertyFallbackUfm] render() called, token.text:", t.text);
      const r = this.parseExpression(t.text);
      if (!r) {
        console.warn("[PropertyFallbackUfm] Failed to parse expression:", t.text);
        return;
      }
      const s = `<ufm-oc-property-fallback 
      expression="${this.escapeHtml(t.text)}"
      primary-property="${r.primary}"
      fallback-properties="${r.fallbacks.join(",")}"
      filters="${this.escapeHtml(this.encodeFilters(r.filters))}">
    </ufm-oc-property-fallback>`;
      return console.log("[PropertyFallbackUfm] returning:", s), s;
    }, this.parseExpression = (t) => {
      try {
        const r = t.split("||").map((n) => n.trim()), s = r[0], l = r.slice(1);
        let o = [], p = l.length > 0 ? l[l.length - 1] : s;
        if (p.includes("|")) {
          const n = p.split("|").map((c) => c.trim()), y = n[0];
          o = n.slice(1).map((c) => {
            const h = c.indexOf(":");
            if (h === -1)
              return { name: c.trim(), params: [] };
            const g = c.substring(0, h).trim(), _ = c.substring(h + 1).split(",").map((P) => P.trim());
            return { name: g, params: _ };
          }), l.length > 0 ? l[l.length - 1] = y : r[0] = y;
        }
        let u = s;
        u.includes("|") && (u = u.split("|")[0].trim());
        let a = l;
        if (a.length > 0 && a[a.length - 1].includes("|")) {
          const n = a[a.length - 1].split("|")[0].trim();
          a = [...a.slice(0, -1), n];
        }
        return {
          primary: u,
          fallbacks: a.filter((n) => n.length > 0),
          filters: o
        };
      } catch (r) {
        return console.error("[PropertyFallbackUfm] Error parsing expression:", t, r), null;
      }
    }, this.escapeHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"), this.encodeFilters = (t) => JSON.stringify(t);
  }
}
export {
  L as PropertyFallbackUfmComponent,
  L as api
};
//# sourceMappingURL=property-fallback.ufm-component-4ipiMUTJ.js.map
