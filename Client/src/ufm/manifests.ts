import type { ManifestUfmComponent } from '@umbraco-cms/backoffice/ufm';

export const manifests: Array<ManifestUfmComponent> = [
  {
    type: 'ufmComponent',
    alias: 'OC.UFMMemberLookup.UfmComponent',
    name: 'Member Lookup UFM Component',
    api: () => import('./member-lookup.ufm-component.js'),
    meta: {
      alias: 'mlu',
    },
  },
];
