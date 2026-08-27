import { UmbUfmFilterBase } from "@umbraco-cms/backoffice/ufm";
import { stripHtml } from "./text-filters.js";

/**
 * `{umbValue: richText | plainText}` — whitespace-aware HTML stripping for the
 * built-in UFM components. The core `stripHtml` filter deletes tags without
 * inserting spaces, which runs adjacent blocks together.
 */
export class OcPlainTextUfmFilterApi extends UmbUfmFilterBase {
  filter(value?: unknown): string {
    return stripHtml(value);
  }
}

export { OcPlainTextUfmFilterApi as api };
