const e = [
  {
    name: "OC Member Name Lookup Entrypoint",
    alias: "OC.MemberNameLookup.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-COoa5-en.js")
  }
], o = [
  {
    type: "ufmComponent",
    alias: "OC.MemberNameLookup.UfmComponent",
    name: "Member Name Lookup UFM Component",
    api: () => import("./member-name-lookup.ufm-component-C7dRXyI1.js"),
    meta: {
      alias: "mnl"
    }
  }
], m = [
  ...e,
  ...o
];
export {
  m as manifests
};
//# sourceMappingURL=oc-member-name-lookup.js.map
