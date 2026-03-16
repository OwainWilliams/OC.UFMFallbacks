export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "OC UFM Member Lookup Entrypoint",
    alias: "OC.UFMMemberLookup.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
