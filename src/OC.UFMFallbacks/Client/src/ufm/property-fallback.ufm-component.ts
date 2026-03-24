import { UmbUfmComponentBase } from '@umbraco-cms/backoffice/ufm';
import type { UfmToken } from '@umbraco-cms/backoffice/ufm';
import './oc-property-fallback.element.js';

export class PropertyFallbackUfmComponent extends UmbUfmComponentBase {

  render = (token: UfmToken): string | undefined => {
    // Expected syntax: {fbk:heading || bodyCopy | truncate:40}
    if (!token.text) return undefined;

    // Parse the expression
    const parsedExpression = this.parseExpression(token.text);
    if (!parsedExpression) {
      console.warn('[PropertyFallbackUfm] Failed to parse expression:', token.text);
      return undefined;
    }

    // Generate the custom element with parsed data
    const html = `<ufm-oc-property-fallback 
      expression="${this.escapeHtml(token.text)}"
      primary-property="${parsedExpression.primary}"
      fallback-properties="${parsedExpression.fallbacks.join(',')}"
      filters="${this.escapeHtml(this.encodeFilters(parsedExpression.filters))}">
    </ufm-oc-property-fallback>`;
    
    return html;
  }

  private parseExpression = (text: string) => {
    try {
      // Split on || to get primary and fallback properties
      const parts = text.split('||').map(part => part.trim());
      const primaryPart = parts[0];
      const fallbackParts = parts.slice(1);

      // Extract filters from the last part
      let filters: Array<{name: string, params: string[]}> = [];
      let lastPart = fallbackParts.length > 0 ? fallbackParts[fallbackParts.length - 1] : primaryPart;
      
      if (lastPart.includes('|')) {
        const splitOnFilters = lastPart.split('|').map(p => p.trim());
        const propertyPart = splitOnFilters[0];
        const filterParts = splitOnFilters.slice(1);

        // Parse filters
        filters = filterParts.map(filterStr => {
          const colonIndex = filterStr.indexOf(':');
          if (colonIndex === -1) {
            return { name: filterStr.trim(), params: [] };
          }
          const name = filterStr.substring(0, colonIndex).trim();
          const params = filterStr.substring(colonIndex + 1).split(',').map(p => p.trim());
          return { name, params };
        });

        // Update the last part to remove filters
        if (fallbackParts.length > 0) {
          fallbackParts[fallbackParts.length - 1] = propertyPart;
        } else {
          parts[0] = propertyPart;
        }
      }

      // Extract primary property (remove any filters)
      let primary = primaryPart;
      if (primary.includes('|')) {
        primary = primary.split('|')[0].trim();
      }

      // Extract fallback properties
      let fallbacks = fallbackParts;
      if (fallbacks.length > 0 && fallbacks[fallbacks.length - 1].includes('|')) {
        const lastFallback = fallbacks[fallbacks.length - 1].split('|')[0].trim();
        fallbacks = [...fallbacks.slice(0, -1), lastFallback];
      }

      return {
        primary: primary,
        fallbacks: fallbacks.filter(f => f.length > 0),
        filters: filters
      };
    } catch (error) {
      console.error('[PropertyFallbackUfm] Error parsing expression:', text, error);
      return null;
    }
  }

  private escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private encodeFilters = (filters: Array<{name: string, params: string[]}>): string => {
    return JSON.stringify(filters);
  }
}

export { PropertyFallbackUfmComponent as api };