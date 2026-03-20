import { html, customElement, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';

// UMB_UFM_RENDER_CONTEXT is not exported from the public API, so we reconstruct the token.
// The context's `value` observable holds the block data object (property aliases as keys).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UMB_UFM_RENDER_CONTEXT = new UmbContextToken<any>('UmbUfmRenderContext');

interface PropertyFilter {
	name: string;
	params: string[];
}

/**
 * Custom UFM component that handles property fallbacks with filter support.
 * Used within UFM contexts (like block list labels) to display property values with fallback logic.
 *
 * Syntax: {fbk:heading || bodyCopy | truncate:40 | uppercase}
 */
@customElement('ufm-oc-property-fallback')
export class OcPropertyFallbackElement extends UmbLitElement {
	/** The full expression for debugging */
	@property({ attribute: 'expression' })
	expression?: string;

	/** The primary property to try first */
	@property({ attribute: 'primary-property' })
	primaryProperty?: string;

	/** Comma-separated fallback properties */
	@property({ attribute: 'fallback-properties' })
	fallbackProperties?: string;

	/** JSON-encoded filters array */
	@property({ attribute: 'filters' })
	filters?: string;

	@state()
	private _value?: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _blockData?: any;

	constructor() {
		super();
		this.consumeContext(UMB_UFM_RENDER_CONTEXT, (context) => {
			// Observe context.value (an RxJS observable) — same pattern as ufm-label-value element
			this.observe(context?.value, (value) => {
				this._blockData = value;
				this._processPropertyFallback();
			}, 'observeValue');
		});
	}

	private _processPropertyFallback(): void {
		if (!this._blockData || !this.primaryProperty) return;

		// The block data object has property aliases as direct keys: { heading: '...', content: {...} }
		let value = this._getPropertyValue(this._blockData, this.primaryProperty);

		// Try fallback properties if primary is empty
		if (!value && this.fallbackProperties) {
			const fallbacks = this.fallbackProperties.split(',').map(p => p.trim()).filter(p => p);
			for (const fallbackProp of fallbacks) {
				value = this._getPropertyValue(this._blockData, fallbackProp);
				if (value) break;
			}
		}

		// Apply filters if we have a value
		if (value && this.filters) {
			try {
				const parsedFilters: PropertyFilter[] = JSON.parse(this.filters);
				value = this._applyFilters(value, parsedFilters);
			} catch (error) {
				console.error('[OcPropertyFallbackElement] Error parsing filters:', error);
			}
		}

		this._value = value || '';
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _getPropertyValue(blockData: any, propertyAlias: string): string | null {
		if (!blockData || !propertyAlias) return null;

		let value = blockData[propertyAlias];

		// RTE values are objects with a `markup` string — extract it
		if (value && typeof value === 'object' && value.markup !== undefined) {
			value = value.markup;
		}

		if (value === null || value === undefined) return null;

		// Handle arrays (e.g., media pickers, content pickers with multiple items)
		// Convert to JSON string so filters like count can parse them
		if (Array.isArray(value)) {
			if (value.length === 0) return null;
			return JSON.stringify(value);
		}

		// Handle block grid/list structures - they might have a 'blocks' or 'items' array
		if (typeof value === 'object' && value !== null) {
			// Block List/Block Grid - check for contentData array
			if (Array.isArray(value.contentData) && value.contentData.length > 0) {
				return JSON.stringify(value.contentData);
			}
			// Check for common array properties in other block structures
			if (Array.isArray(value.blocks) && value.blocks.length > 0) {
				return JSON.stringify(value.blocks);
			}
			if (Array.isArray(value.items) && value.items.length > 0) {
				return JSON.stringify(value.items);
			}
			// If it's an object but not a known structure, try to stringify it
			try {
				return JSON.stringify(value);
			} catch {
				// Fall through to String conversion
			}
		}

		const stringValue = String(value).trim();
		if (stringValue.length === 0) return null;

		// For HTML strings, only consider non-empty if there's actual text content
		if (stringValue.startsWith('<')) {
			const textContent = stringValue.replace(/<[^>]*>/g, '').trim();
			return textContent.length > 0 ? stringValue : null;
		}

		return stringValue;
	}

	private _applyFilters(value: string, filters: PropertyFilter[]): string {
		let result = value;

		for (const filter of filters) {
			result = this._applySingleFilter(result, filter);
		}

		return result;
	}

	private _applySingleFilter(value: string, filter: PropertyFilter): string {
		switch (filter.name.toLowerCase()) {
			case 'truncate':
				return this._truncate(value, filter.params);
			case 'striphtml':
			case 'ncrichtext':
				return this._stripHtml(value);
			case 'uppercase':
				return value.toUpperCase();
			case 'lowercase':
				return value.toLowerCase();
			case 'wordlimit':
				return this._wordLimit(value, filter.params);
			case 'count':
			case 'arraycount':
				return this._arrayCount(value, filter.params);

			default:
				console.warn('[OcPropertyFallbackElement] Unknown filter:', filter.name);
				return value;
		}
	}

	private _truncate(value: string, params: string[]): string {
		const length = params.length > 0 ? parseInt(params[0], 10) : 100;
		if (value.length <= length) return value;

		// Find last space before the limit
		const truncated = value.substring(0, length);
		const lastSpace = truncated.lastIndexOf(' ');

		if (lastSpace > 0 && lastSpace > length * 0.8) {
			return truncated.substring(0, lastSpace) + '...';
		}

		return truncated + '...';
	}

	private _stripHtml(value: string): string {
		// Remove HTML tags
		return value.replace(/<[^>]*>/g, '').trim();
	}

	private _wordLimit(value: string, params: string[]): string {
		const limit = params.length > 0 ? parseInt(params[0], 10) : 10;
		const words = value.split(/\s+/);

		if (words.length <= limit) return value;

		return words.slice(0, limit).join(' ') + '...';
	}

	private _arrayCount(value: string, params: string[]): string {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				const count = parsed.length;

				// If we have singular and plural text params, append the appropriate one
				if (params.length >= 2) {
					const singular = params[0];
					const plural = params[1];
					const text = count === 1 ? singular : plural;
					return `${count} ${text}`;
				}

				// If we only have one param, always append it
				if (params.length === 1) {
					return `${count} ${params[0]}`;
				}

				// Otherwise just return the count
				return String(count);
			}
		} catch {
			// Not valid JSON, ignore
		}

		// If the value itself is already an array (though unlikely as a string), return as-is
		return value;
	}

	render() {
		if (this._value === undefined) {
			return html`<span class="ufm-property-fallback loading">...</span>`;
		}

		if (!this._value) {
			return html`<span class="ufm-property-fallback empty"></span>`;
		}

		return html`<span class="ufm-property-fallback">${this._value}</span>`;
	}
}