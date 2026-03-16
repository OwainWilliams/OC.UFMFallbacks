import { UmbUfmComponentBase as c } from "@umbraco-cms/backoffice/ufm";
import { property as p, state as u, customElement as f, html as l } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as d } from "@umbraco-cms/backoffice/lit-element";
import { UmbContextToken as h } from "@umbraco-cms/backoffice/context-api";
import { UMB_AUTH_CONTEXT as b } from "@umbraco-cms/backoffice/auth";
var _ = Object.defineProperty, v = Object.getOwnPropertyDescriptor, m = (t, e, o, r) => {
  for (var n = r > 1 ? void 0 : r ? v(e, o) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (n = (r ? a(e, o, n) : a(n)) || n);
  return r && n && _(e, o, n), n;
};
const x = "/umbraco/management/api/v1/oc/ocmembernamelookup/member-field", y = new h("UmbUfmRenderContext");
function g(t) {
  if (typeof t != "string" || !t) return;
  const e = "umb://member/";
  return t.startsWith(e) ? t.substring(e.length) : t;
}
let i = class extends d {
  constructor() {
    super(...arguments), this._loading = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(b, (t) => {
      this._authContext = t;
    }), this.consumeContext(y, (t) => {
      t && this.observe(
        t.value,
        (e) => {
          if (!e || !this.propertyAlias) {
            this._value = void 0;
            return;
          }
          const o = e[this.propertyAlias], r = g(o);
          r && this.memberField ? this._fetchMemberField(r, this.memberField) : this._value = void 0;
        },
        "observeBlockData"
      );
    });
  }
  /**
   * Fetches a specific field value from the member via the management API.
   * Uses Bearer token authentication as required by Umbraco 14+ management API.
   */
  async _fetchMemberField(t, e) {
    this._loading = !0;
    try {
      const o = `${x}?memberKey=${encodeURIComponent(t)}&field=${encodeURIComponent(e)}`, r = await this._authContext?.getLatestToken?.(), n = r ? { Authorization: `Bearer ${r}` } : {}, s = await fetch(o, { headers: n });
      if (s.ok) {
        const a = await s.text();
        this._value = a;
      } else
        this._value = "";
    } catch {
      this._value = "";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return this._loading ? l`<span>…</span>` : l`<span>${this._value ?? ""}</span>`;
  }
};
m([
  p({ attribute: "property-alias" })
], i.prototype, "propertyAlias", 2);
m([
  p({ attribute: "member-field" })
], i.prototype, "memberField", 2);
m([
  u()
], i.prototype, "_value", 2);
m([
  u()
], i.prototype, "_loading", 2);
i = m([
  f("ufm-oc-mnl-value")
], i);
class F extends c {
  render(e) {
    if (!e.text) return;
    const o = e.text.indexOf(".");
    if (o === -1) return;
    const r = e.text.substring(0, o), n = e.text.substring(o + 1);
    if (!r || !n) return;
    const s = `<ufm-oc-mnl-value property-alias="${r}" member-field="${n}"></ufm-oc-mnl-value>`;
    return console.log("[MnlUfm] render() called, token.text:", e.text, "→ returning:", s), s;
  }
}
export {
  F as MemberNameLookupUfmComponent,
  F as api
};
//# sourceMappingURL=member-name-lookup.ufm-component-C7dRXyI1.js.map
