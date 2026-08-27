/**
 * Shared, framework-free text helpers used by both the `{fbk:}` component's
 * filter pipeline and the standalone `ufmFilter` extensions, so the two paths
 * always behave identically.
 */

/** Normalises a property value to markup text. RTE values are `{ markup, blocks }` objects. */
export function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "markup" in (value as object)) {
    return String((value as { markup?: unknown }).markup ?? "");
  }
  return String(value);
}

/**
 * Rich-text markup -> readable single-line text.
 *
 * Every tag becomes a space (so `<h2>Welcome</h2><p>We're glad…` reads
 * "Welcome We're glad…" rather than "WelcomeWe're glad…"), HTML entities are
 * decoded and whitespace is collapsed.
 */
export function stripHtml(value: unknown): string {
  const spaced = toText(value).replace(/<[^>]*>/g, " ");
  const decoded = new DOMParser().parseFromString(spaced, "text/html").body.textContent ?? "";
  return decoded.replace(/\s+/g, " ").trim();
}

/**
 * Prefixes a non-empty value with a separator (default " - ") and returns an
 * empty string otherwise, so labels like `Card Grid{fbk: heading | dash}`
 * render "Card Grid - Our services" or just "Card Grid" — never "Card Grid - ".
 */
export function dash(value: unknown, separator = " - "): string {
  const text = toText(value).trim();
  return text ? `${separator}${text}` : "";
}
