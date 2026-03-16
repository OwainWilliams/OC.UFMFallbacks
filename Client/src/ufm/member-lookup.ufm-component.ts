import { UmbUfmComponentBase } from '@umbraco-cms/backoffice/ufm';
import type { UfmToken } from '@umbraco-cms/backoffice/ufm';
import './oc-mnl-value.element.js';

export class MemberLookupUfmComponent extends UmbUfmComponentBase {
  render(token: UfmToken): string | undefined {
    // Expected syntax: {mnl:propertyAlias.fieldName}
    if (!token.text) return undefined;

    const dotIndex = token.text.indexOf('.');
    if (dotIndex === -1) return undefined;

    const propertyAlias = token.text.substring(0, dotIndex);
    const memberField = token.text.substring(dotIndex + 1);

    if (!propertyAlias || !memberField) return undefined;

    const html = `<ufm-oc-mnl-value property-alias="${propertyAlias}" member-field="${memberField}"></ufm-oc-mnl-value>`;
    console.log('[MnlUfm] render() called, token.text:', token.text, '→ returning:', html);
    return html;
  }
}

export { MemberLookupUfmComponent as api };
