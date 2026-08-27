import { UmbUfmComponentBase as _ } from "@umbraco-cms/backoffice/ufm";
import { property as m, state as k, customElement as x, html as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as w } from "@umbraco-cms/backoffice/lit-element";
import { UmbContextToken as F } from "@umbraco-cms/backoffice/context-api";
import { UmbDocumentItemRepository as O } from "@umbraco-cms/backoffice/document";
import { UmbMediaItemRepository as v } from "@umbraco-cms/backoffice/media";
import { d as E, s as U } from "./text-filters-BnDAYd6F.js";
var C = Object.defineProperty, N = Object.getOwnPropertyDescriptor, c = (e, r, t, n) => {
  for (var s = n > 1 ? void 0 : n ? N(r, t) : r, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(r, t, s) : a(s)) || s);
  return n && s && C(r, t, s), s;
};
const j = new F("UmbUfmRenderContext");
let p = class extends w {
  constructor() {
    super(), this._documentRepository = new O(this), this._mediaRepository = new v(this), this.consumeContext(j, (e) => {
      this.observe(
        e?.value,
        (r) => {
          this._blockData = r, this._processPropertyFallback();
        },
        "observeValue"
      );
    });
  }
  async _processPropertyFallback() {
    if (!this._blockData || !this.primaryProperty) return;
    if (this.primaryProperty.includes(".")) {
      const r = this.primaryProperty.split(".");
      this.primaryProperty = r[0], this.nestedProperty = r[1] || null;
    }
    let e = await this._getPropertyValue(this._blockData, this.primaryProperty);
    if (!e && this.fallbackProperties) {
      const r = this.fallbackProperties.split(",").map((t) => t.trim()).filter((t) => t);
      for (const t of r)
        if (e = await this._getPropertyValue(this._blockData, t), e) break;
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
  async _getPropertyValue(e, r) {
    if (!e || !r) return null;
    let t = e[r] ?? e.grid;
    if (t && typeof t == "object" && t.markup !== void 0 && (t = t.markup), t == null) return null;
    if (Array.isArray(t))
      return t.length === 0 ? null : t[0]?.unique !== void 0 && this.nestedProperty === "docName" ? await this._fetchItemNames(t, "unique", this._documentRepository) : this.nestedProperty === "mediaName" ? await this._fetchItemNames(t, "mediaKey", this._mediaRepository) : this.nestedProperty === "list" ? t.map((s) => String(s)).join(", ") || null : this.nestedProperty && t[0]?.[this.nestedProperty] ? t.map((i) => i[this.nestedProperty] || "").filter((i) => i).join(", ") || null : JSON.stringify(t);
    if (typeof t == "object" && t !== null) {
      if (Array.isArray(t.contentData) && t.contentData.length > 0) {
        if (!this.nestedProperty)
          return JSON.stringify(t.contentData);
        const s = t.contentData.flatMap((i) => i.values.filter((a) => a.alias === this.nestedProperty).map((a) => a.value));
        return s.length > 0 ? s.join(", ") : null;
      }
      try {
        return JSON.stringify(t);
      } catch {
      }
    }
    const n = String(t).trim();
    return n ? n.startsWith("<") ? n.replace(/<[^>]*>/g, "").trim() ? n : null : n : null;
  }
  async _fetchItemNames(e, r, t) {
    const n = e.map((s) => s[r]).filter((s) => s);
    if (n.length === 0) return null;
    try {
      const s = await t.requestItems(n);
      if (s.data) {
        const i = s.data.map((a) => a.variants[0]?.name || "").filter((a) => a);
        return i.length > 0 ? i.join(", ") : null;
      }
    } catch (s) {
      console.error("[OcPropertyFallbackElement] Error fetching item names:", s);
    }
    return null;
  }
  _applyFilters(e, r) {
    let t = e;
    for (const n of r)
      t = this._applySingleFilter(t, n);
    return t;
  }
  _applySingleFilter(e, r) {
    switch (r.name.toLowerCase()) {
      case "truncate":
        return this._truncate(e, r.params);
      case "striphtml":
      case "ncrichtext":
      case "plaintext":
        return U(e);
      case "dash":
        return E(e);
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
    const n = e.substring(0, t), s = n.lastIndexOf(" ");
    return s > 0 && s > t * 0.8 ? n.substring(0, s) + "..." : n + "...";
  }
  _wordLimit(e, r) {
    const t = r.length > 0 ? parseInt(r[0], 10) : 10, n = e.split(/\s+/);
    return n.length <= t ? e : n.slice(0, t).join(" ") + "...";
  }
  _arrayCount(e, r) {
    try {
      const t = JSON.parse(e);
      if (Array.isArray(t)) {
        const n = t.length;
        if (r.length >= 2) {
          const s = r[0], i = r[1];
          return `${n} ${n === 1 ? s : i}`;
        }
        return r.length === 1 ? `${n} ${r[0]}` : String(n);
      }
    } catch {
    }
    return e;
  }
  render() {
    return this._value === void 0 ? y`<span class="ufm-property-fallback loading">...</span>` : this._value ? y`<span class="ufm-property-fallback">${this._value}</span>` : y`<span class="ufm-property-fallback empty"></span>`;
  }
};
c([
  m({ attribute: "expression" })
], p.prototype, "expression", 2);
c([
  m({ attribute: "primary-property" })
], p.prototype, "primaryProperty", 2);
c([
  m({ attribute: "fallback-properties" })
], p.prototype, "fallbackProperties", 2);
c([
  m({ attribute: "nested-property" })
], p.prototype, "nestedProperty", 2);
c([
  m({ attribute: "filters" })
], p.prototype, "filters", 2);
c([
  k()
], p.prototype, "_value", 2);
p = c([
  x("ufm-oc-property-fallback")
], p);
class V extends _ {
  constructor() {
    super(...arguments), this.render = (r) => {
      if (!r.text) return;
      const t = this.parseExpression(r.text);
      if (!t) {
        console.warn("[PropertyFallbackUfm] Failed to parse expression:", r.text);
        return;
      }
      return `<ufm-oc-property-fallback 
      expression="${this.escapeHtml(r.text)}"
      primary-property="${t.primary}"
      fallback-properties="${t.fallbacks.join(",")}"
      filters="${this.escapeHtml(this.encodeFilters(t.filters))}">
    </ufm-oc-property-fallback>`;
    }, this.parseExpression = (r) => {
      try {
        const t = r.split("||").map((l) => l.trim()), n = t[0], s = t.slice(1);
        let i = [], a = s.length > 0 ? s[s.length - 1] : n;
        if (a.includes("|")) {
          const l = a.split("|").map((u) => u.trim()), d = l[0];
          i = l.slice(1).map((u) => {
            const h = u.indexOf(":");
            if (h === -1)
              return { name: u.trim(), params: [] };
            const g = u.substring(0, h).trim(), b = u.substring(h + 1).split(",").map((P) => P.trim());
            return { name: g, params: b };
          }), s.length > 0 ? s[s.length - 1] = d : t[0] = d;
        }
        let f = n;
        f.includes("|") && (f = f.split("|")[0].trim());
        let o = s;
        if (o.length > 0 && o[o.length - 1].includes("|")) {
          const l = o[o.length - 1].split("|")[0].trim();
          o = [...o.slice(0, -1), l];
        }
        return {
          primary: f,
          fallbacks: o.filter((l) => l.length > 0),
          filters: i
        };
      } catch (t) {
        return console.error("[PropertyFallbackUfm] Error parsing expression:", r, t), null;
      }
    }, this.escapeHtml = (r) => r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"), this.encodeFilters = (r) => JSON.stringify(r);
  }
}
export {
  V as PropertyFallbackUfmComponent,
  V as api
};
//# sourceMappingURL=property-fallback.ufm-component-B4_kimqe.js.map
