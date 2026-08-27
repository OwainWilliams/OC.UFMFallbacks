import { UmbUfmFilterBase } from "@umbraco-cms/backoffice/ufm";
import { dash } from "./text-filters.js";

/**
 * `{umbValue: heading | dash}` — renders " - {value}" when the value is set and
 * nothing when it is empty, removing the dangling separator from labels such as
 * `Card Grid{umbValue: heading | truncate:40:... | dash}`.
 */
export class OcDashUfmFilterApi extends UmbUfmFilterBase {
  filter(value?: unknown): string {
    return dash(value);
  }
}

export { OcDashUfmFilterApi as api };
