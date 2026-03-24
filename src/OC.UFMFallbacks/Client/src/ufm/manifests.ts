import type { ManifestUfmComponent } from '@umbraco-cms/backoffice/ufm';

export const manifests: Array<ManifestUfmComponent> = [
  {
    type: 'ufmComponent',
    alias: 'OC.UFMFallbacks.PropertyFallback',
    name: 'Property Fallback UFM Component',
    api: () => import('./property-fallback.ufm-component.js'),
    meta: {
      alias: 'fbk',
    },
  },
];
