import type { ManifestUfmComponent, ManifestUfmFilter } from '@umbraco-cms/backoffice/ufm';

export const manifests: Array<ManifestUfmComponent | ManifestUfmFilter> = [
  {
    type: 'ufmComponent',
    alias: 'OC.UFMFallbacks.PropertyFallback',
    name: 'Property Fallback UFM Component',
    api: () => import('./property-fallback.ufm-component.js'),
    meta: {
      alias: 'fbk',
    },
  },
  // Standalone UFM filters — usable with the built-in {umbValue:} / {=} components
  // as well as inside {fbk:} expressions.
  {
    type: 'ufmFilter',
    alias: 'OC.UFMFallbacks.UfmFilter.PlainText',
    name: 'Plain Text UFM Filter',
    api: () => import('./filters/plain-text.filter.js'),
    meta: {
      alias: 'plainText',
    },
  },
  {
    type: 'ufmFilter',
    alias: 'OC.UFMFallbacks.UfmFilter.Dash',
    name: 'Dash UFM Filter',
    api: () => import('./filters/dash.filter.js'),
    meta: {
      alias: 'dash',
    },
  },
];
