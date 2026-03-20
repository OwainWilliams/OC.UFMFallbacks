# OC.UFMFallbacks

Extends **Umbraco Flavored Markdown (UFM)** with a `{fbk:}` component that supports property fallbacks and text filters inside block labels and other UFM contexts.

Requires **Umbraco 17** and **.NET 10**.

---

## Installation

```bash
dotnet add package OC.UFMFallbacks
```

No additional configuration needed — the package self-registers on startup.

---

## Syntax

```
{fbk: primaryProperty || fallback1 || fallback2 | filter1 | filter2:param}
```

**Examples:**

```
{fbk: heading}
{fbk: content || heading}
{fbk: content || heading | striphtml | truncate:60}
```

If `content` is empty (including blank rich text editors), the next fallback property is tried automatically.

---

## Available filters

| Filter | Description |
|---|---|
| `striphtml` / `ncrichtext` | Removes all HTML tags |
| `truncate:N` | Truncates to N characters at a word boundary |
| `wordlimit:N` | Limits to N words |
| `uppercase` | Converts to upper case |
| `lowercase` | Converts to lower case |
| `count` / `arraycount` | Counts items in arrays (media/content pickers, block lists). Use `count:singular,plural` for smart pluralization (e.g., `count:image,images`) |

For rich text properties, use `striphtml` before `truncate` to avoid truncating mid-tag.

---

For full documentation visit [github.com/OwainWilliams/OC.UFMFallbacks](https://github.com/OwainWilliams/OC.UFMFallbacks).

MIT © Owain Williams
