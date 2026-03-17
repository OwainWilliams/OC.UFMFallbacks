# OC.UFMFallbacks

An [Umbraco](https://umbraco.com) package that extends **Umbraco Flavored Markdown (UFM)** with a `{fbk:}` component, giving you property fallbacks and text filters directly inside block labels and other UFM contexts.

![Umbraco Marketplace](https://img.shields.io/badge/Umbraco%20Marketplace-Free-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Umbraco 17](https://img.shields.io/badge/Umbraco-17-brightgreen)

---

## Requirements

- Umbraco **17.x**
- .NET 10

---

## Installation

### Via NuGet (recommended)

```bash
dotnet add package OC.UFMFallbacks
```

Or search for **OC.UFMFallbacks** in the NuGet Package Manager inside Visual Studio.

No additional configuration is required — the package self-registers via Umbraco's composition system on startup.

---

## What it does

The package registers a custom UFM component with the alias `fbk`. You use it inside any UFM-enabled field (e.g. block list / block grid labels) to:

- **Display a property value** from the current block
- **Fall back** to one or more alternative properties when the primary value is empty
- **Apply filters** to transform the output (strip HTML, truncate, change case, etc.)

---

## Syntax

```
{fbk: primaryProperty || fallback1 || fallback2 | filter1 | filter2:param}
```

| Part | Description |
|---|---|
| `primaryProperty` | The property alias to try first |
| `\|\| fallback1` | One or more fallback aliases, tried in order if the previous is empty |
| `\| filter` | One or more filters to apply to the resolved value |

### Basic example — display a heading

```
{fbk: heading}
```

### Fallback example — content with heading as fallback

```
{fbk: content || heading}
```

If `content` is empty (including blank rich text), the value of `heading` is used instead.

### Filters example — strip HTML then truncate

```
{fbk: content || heading | striphtml | truncate:60}
```

### Full block label example

```
**Rich Text**: {fbk: content || heading | striphtml | truncate:60} ${$settings.hide == '1' ? '[HIDDEN]' : ''}
```

---

## Available filters

| Filter | Alias(es) | Description | Parameters |
|---|---|---|---|
| Strip HTML | `striphtml`, `ncrichtext` | Removes all HTML tags, leaving plain text | — |
| Truncate | `truncate` | Truncates to N characters, breaking at a word boundary | `truncate:60` |
| Word limit | `wordlimit` | Limits output to N words | `wordlimit:10` |
| Uppercase | `uppercase` | Converts to upper case | — |
| Lowercase | `lowercase` | Converts to lower case | — |

Filters are applied left-to-right. For rich text properties, use `striphtml` before `truncate` to avoid truncating mid-tag.

---

## Property type support

| Property type | Behaviour |
|---|---|
| Text / Textarea | Value used directly |
| Rich Text Editor | HTML markup extracted; treated as empty if no visible text content |
| Any other type | `ToString()` called on the value |

---

## Contributing

Issues and pull requests are welcome at [github.com/OwainWilliams/OC.UFMFallbacks](https://github.com/OwainWilliams/OC.UFMFallbacks).

---

## License

MIT © Owain Williams
