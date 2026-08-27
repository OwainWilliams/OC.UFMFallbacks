const a = [
  // Add any entrypoint manifests here if needed
], t = [
  {
    type: "ufmComponent",
    alias: "OC.UFMFallbacks.PropertyFallback",
    name: "Property Fallback UFM Component",
    api: () => import("./property-fallback.ufm-component-B4_kimqe.js"),
    meta: {
      alias: "fbk"
    }
  },
  // Standalone UFM filters — usable with the built-in {umbValue:} / {=} components
  // as well as inside {fbk:} expressions.
  {
    type: "ufmFilter",
    alias: "OC.UFMFallbacks.UfmFilter.PlainText",
    name: "Plain Text UFM Filter",
    api: () => import("./plain-text.filter-G6fXuWka.js"),
    meta: {
      alias: "plainText"
    }
  },
  {
    type: "ufmFilter",
    alias: "OC.UFMFallbacks.UfmFilter.Dash",
    name: "Dash UFM Filter",
    api: () => import("./dash.filter-CUf1h9eE.js"),
    meta: {
      alias: "dash"
    }
  }
], e = [
  ...a,
  ...t
];
export {
  e as manifests
};
//# sourceMappingURL=oc-ufm-fallbacks.js.map
