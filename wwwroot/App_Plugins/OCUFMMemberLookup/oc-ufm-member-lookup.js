const o = [
  {
    name: "OC UFM Member Lookup Entrypoint",
    alias: "OC.UFMMemberLookup.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BbtUKYiT.js")
  }
], e = [
  {
    type: "ufmComponent",
    alias: "OC.UFMMemberLookup.UfmComponent",
    name: "Member Lookup UFM Component",
    api: () => import("./member-lookup.ufm-component-Dmg1CxX_.js"),
    meta: {
      alias: "mlu"
    }
  }
], t = [
  ...o,
  ...e
];
export {
  t as manifests
};
//# sourceMappingURL=oc-ufm-member-lookup.js.map
