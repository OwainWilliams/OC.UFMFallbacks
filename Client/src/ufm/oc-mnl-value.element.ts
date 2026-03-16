import { html, customElement, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';

const MEMBER_FIELD_API_PATH = '/umbraco/management/api/v1/oc/ocmembernamelookup/member-field';

// Manually reconstructed context token for UFM render context since it's not exported from the public API.
// This provides access to the block's raw data object within UFM (Umbraco Flavored Markdown) components.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UMB_UFM_RENDER_CONTEXT = new UmbContextToken<any>('UmbUfmRenderContext');

/**
 * Extracts a GUID from either a UDI format ("umb://member/{guid}") or plain GUID string.
 * This handles both formats that might be stored in member picker properties.
 */
function extractMemberKey(value: unknown): string | undefined {
	if (typeof value !== 'string' || !value) return undefined;

	const udiPrefix = 'umb://member/';
	if (value.startsWith(udiPrefix)) {
		return value.substring(udiPrefix.length);
	}

	// Assume it's already a plain GUID if not UDI format
	return value;
}

/**
 * Custom UFM component that fetches and displays specific member field values.
 * Used within UFM contexts (like block list labels) to show member information.
 */
@customElement('ufm-oc-mnl-value')
export class OcMnlValueElement extends UmbLitElement {
	/** The property alias from the block data to read the member reference from */
	@property({ attribute: 'property-alias' })
	propertyAlias?: string;

	/** The member field name to fetch and display (e.g., 'firstName', 'email') */
	@property({ attribute: 'member-field' })
	memberField?: string;

	@state()
	private _value?: string;

	@state()
	private _loading = false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _authContext?: any;

	override connectedCallback(): void {
		super.connectedCallback();

		// Set up authentication context for API calls
		this.consumeContext(UMB_AUTH_CONTEXT, (auth) => {
			this._authContext = auth;
		});

		// Subscribe to the UFM render context to get block data.
		// This context is provided by umb-ufm-render and contains the block's content data
		// as an observable, similar to how built-in UFM components like {umbValue:alias} work.
		this.consumeContext(UMB_UFM_RENDER_CONTEXT, (context) => {
			if (!context) return;

			// Observe changes to the block's data and extract the member reference
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.observe(
				context.value as any,
				(blockData: Record<string, unknown> | undefined) => {
					if (!blockData || !this.propertyAlias) {
						this._value = undefined;
						return;
					}

					const rawValue = blockData[this.propertyAlias];
					const memberKey = extractMemberKey(rawValue);

					if (memberKey && this.memberField) {
						this._fetchMemberField(memberKey, this.memberField);
					} else {
						this._value = undefined;
					}
				},
				'observeBlockData',
			);
		});
	}

	/**
	 * Fetches a specific field value from the member via the management API.
	 * Uses Bearer token authentication as required by Umbraco 14+ management API.
	 */
	private async _fetchMemberField(memberKey: string, field: string): Promise<void> {
		this._loading = true;

		try {
			const url = `${MEMBER_FIELD_API_PATH}?memberKey=${encodeURIComponent(memberKey)}&field=${encodeURIComponent(field)}`;
			const token = await this._authContext?.getLatestToken?.();
			const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

			const response = await fetch(url, { headers });

			if (response.ok) {
				const data = await response.text();
				this._value = data;
			} else {
				this._value = '';
			}
		} catch (error) {
			this._value = '';
		} finally {
			this._loading = false;
		}
	}

	override render() {
		if (this._loading) return html`<span>…</span>`;
		return html`<span>${this._value ?? ''}</span>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ufm-oc-mnl-value': OcMnlValueElement;
	}
}
