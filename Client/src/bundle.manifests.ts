import { manifests as entrypoints } from "./entrypoints/manifest.js";
import { manifests as ufm } from "./ufm/manifests.js";
import type { ManifestUfmComponent } from '@umbraco-cms/backoffice/ufm';

// Job of the bundle is to collate all the manifests from different parts of the extension and load other manifests
// We load this bundle from umbraco-package.json
export const manifests: Array<ManifestUfmComponent> = [
  ...entrypoints,
  ...ufm,
];
