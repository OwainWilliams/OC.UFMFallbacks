import { html, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbDocumentItemRepository } from "@umbraco-cms/backoffice/document";
import { UmbMediaItemRepository } from "@umbraco-cms/backoffice/media"; // Add this import

// UMB_UFM_RENDER_CONTEXT is not exported from the public API, so we reconstruct the token.
// The context's `value` observable holds the block data object (property aliases as keys).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UMB_UFM_RENDER_CONTEXT = new UmbContextToken<any>("UmbUfmRenderContext");

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
@customElement("ufm-oc-property-fallback")
export class OcPropertyFallbackElement extends UmbLitElement {
  /** The full expression for debugging */
  @property({ attribute: "expression" })
  expression?: string;

  /** The primary property to try first */
  @property({ attribute: "primary-property" })
  primaryProperty?: string;

  /** Comma-separated fallback properties */
  @property({ attribute: "fallback-properties" })
  fallbackProperties?: string;

  /** To access property values within a complex primary object */
  @property({ attribute: "nested-property" })
  nestedProperty?: string | null;

  /** JSON-encoded filters array */
  @property({ attribute: "filters" })
  filters?: string;

  @state()
  private _value?: string;

  private _documentRepository = new UmbDocumentItemRepository(this);
  private _mediaRepository = new UmbMediaItemRepository(this);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _blockData?: any;

  constructor() {
    super();
    this.consumeContext(UMB_UFM_RENDER_CONTEXT, (context) => {
      // Observe context.value (an RxJS observable) — same pattern as ufm-label-value element
      //   console.log(context?.value.source._value?.nestedList != null ? "nestedlist" : "no nested list");
      this.observe(
        context?.value,
        (value) => {
          this._blockData = value;
          this._processPropertyFallback();
        },
        "observeValue",
      );
    });
  }

  private async _processPropertyFallback(): Promise<void> {
    if (!this._blockData || !this.primaryProperty) return;

    //  This is a temp object to enable us to access the primary property, and the nested block property that we want to display in the label.
    if (this.primaryProperty.includes(".")) {
      const parts = this.primaryProperty.split(".");
      this.primaryProperty = parts[0];
      this.nestedProperty = parts[1] || null;
    }

    // The block data object has property aliases as direct keys: { heading: '...', content: {...} }
    let value = await this._getPropertyValue(this._blockData, this.primaryProperty);

    // Try fallback properties if primary is empty
    if (!value && this.fallbackProperties) {
      const fallbacks = this.fallbackProperties
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
      for (const fallbackProp of fallbacks) {
        value = await this._getPropertyValue(this._blockData, fallbackProp);
        if (value) break;
      }
    }

    // Apply filters if we have a value
    if (value && this.filters) {
      try {
        const parsedFilters: PropertyFilter[] = JSON.parse(this.filters);
        value = this._applyFilters(value, parsedFilters);
      } catch (error) {
        console.error("[OcPropertyFallbackElement] Error parsing filters:", error);
      }
    }

    this._value = value || "";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _getPropertyValue(blockData: any, propertyAlias: string): Promise<string | null> {
    if (!blockData || !propertyAlias) return null;

    let value = blockData[propertyAlias] ?? blockData["grid"];

    // RTE values are objects with a `markup` string — extract it
    if (value && typeof value === "object" && value.markup !== undefined) {
      value = value.markup;
    }

    if (value === null || value === undefined) return null;

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return null;

      // CONTENT PICKER - nested property 'docName'
      if (value[0]?.unique !== undefined && this.nestedProperty === "docName") {
        return await this._fetchItemNames(value, "unique", this._documentRepository);
      }

      // MEDIA PICKER - nested property 'mediaName'
      if (this.nestedProperty === "mediaName") {
        return await this._fetchItemNames(value, "mediaKey", this._mediaRepository);
      }

      // MULTIPLE TEXT STRINGS - nested property 'list'
      if (this.nestedProperty === "list") {
        return value.map((v) => String(v)).join(", ") || null;
      }

      // URL PICKER or other nested properties
      if (this.nestedProperty && value[0]?.[this.nestedProperty]) {
        const joined = value
          .map((item: any) => item[this.nestedProperty!] || "")
          .filter((v: string) => v)
          .join(", ");
        return joined || null;
      }

      return JSON.stringify(value);
    }

    // Handle objects (BLOCKLIST and others)
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value.contentData) && value.contentData.length > 0) {
        if (!this.nestedProperty) {
          return JSON.stringify(value.contentData);
        }

        const values = value.contentData.flatMap((item: any) => {
          return item.values.filter((val: { alias: string; value: any }) => val.alias === this.nestedProperty).map((val: { value: any }) => val.value);
        });

        return values.length > 0 ? values.join(", ") : null;
      }

      try {
        return JSON.stringify(value);
      } catch {
        // Fall through to String conversion
      }
    }

    // Handle strings
    const stringValue = String(value).trim();
    if (!stringValue) return null;

    // For HTML strings, only consider non-empty if there's actual text content
    if (stringValue.startsWith("<")) {
      const textContent = stringValue.replace(/<[^>]*>/g, "").trim();
      return textContent ? stringValue : null;
    }

    return stringValue;
  }

  private async _fetchItemNames(items: any[], keyProperty: string, repository: typeof this._documentRepository | typeof this._mediaRepository): Promise<string | null> {
    const keys = items.map((item: any) => item[keyProperty]).filter((k: string) => k);
    if (keys.length === 0) return null;

    try {
      const result = await repository.requestItems(keys);
      if (result.data) {
        const names = result.data.map((doc) => doc.variants[0]?.name || "").filter((name) => name);
        return names.length > 0 ? names.join(", ") : null;
      }
    } catch (error) {
      console.error("[OcPropertyFallbackElement] Error fetching item names:", error);
    }

    return null;
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
      case "truncate":
        return this._truncate(value, filter.params);
      case "striphtml":
      case "ncrichtext":
        return this._stripHtml(value);
      case "uppercase":
        return value.toUpperCase();
      case "lowercase":
        return value.toLowerCase();
      case "wordlimit":
        return this._wordLimit(value, filter.params);
      case "count":
      case "arraycount":
        return this._arrayCount(value, filter.params);

      default:
        console.warn("[OcPropertyFallbackElement] Unknown filter:", filter.name);
        return value;
    }
  }

  private _truncate(value: string, params: string[]): string {
    const length = params.length > 0 ? parseInt(params[0], 10) : 100;
    if (value.length <= length) return value;

    // Find last space before the limit
    const truncated = value.substring(0, length);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > 0 && lastSpace > length * 0.8) {
      return truncated.substring(0, lastSpace) + "...";
    }

    return truncated + "...";
  }

  private _stripHtml(value: string): string {
    // Remove HTML tags
    return value.replace(/<[^>]*>/g, "").trim();
  }

  private _wordLimit(value: string, params: string[]): string {
    const limit = params.length > 0 ? parseInt(params[0], 10) : 10;
    const words = value.split(/\s+/);

    if (words.length <= limit) return value;

    return words.slice(0, limit).join(" ") + "...";
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
