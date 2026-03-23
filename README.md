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

| Part              | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `primaryProperty` | The property alias to try first                                       |
| `\|\| fallback1`  | One or more fallback aliases, tried in order if the previous is empty |
| `\| filter`       | One or more filters to apply to the resolved value                    |

### Basic example — display a heading

```
{fbk: heading}
```

### Nested Items Example - display a property value from each nested block within a parent block (in a comma delimited list)

For this to work, this must be the alias of a block list (an object is required). If a nested property key isn't provided, it will return the raw object for the nested block.

```
{fbk: nestedBlocks.heading}
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

| Filter     | Alias(es)                 | Description                                                                         | Parameters                                                                                             |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Strip HTML | `striphtml`, `ncrichtext` | Removes all HTML tags, leaving plain text                                           | —                                                                                                      |
| Truncate   | `truncate`                | Truncates to N characters, breaking at a word boundary                              | `truncate:60`                                                                                          |
| Word limit | `wordlimit`               | Limits output to N words                                                            | `wordlimit:10`                                                                                         |
| Uppercase  | `uppercase`               | Converts to upper case                                                              | —                                                                                                      |
| Lowercase  | `lowercase`               | Converts to lower case                                                              | —                                                                                                      |
| Count      | `count`, `arraycount`     | Counts items in an array (media pickers, content pickers, block lists, block grids) | `count` (just number)<br>`count:text` (number + text)<br>`count:singular,plural` (smart pluralization) |

Filters are applied left-to-right. For rich text properties, use `striphtml` before `truncate` to avoid truncating mid-tag.

### Count filter examples

```
{fbk: images | count}
```

Output: `3`

```
{fbk: images | count:image,images}
```

Output: `1 image` or `3 images`

```
{fbk: blocks | count:item(s)}
```

Output: `3 item(s)`

---

## Property type support

| Property type             | Behaviour                                                          |
| ------------------------- | ------------------------------------------------------------------ |
| Text / Textarea           | Value used directly                                                |
| Rich Text Editor          | HTML markup extracted; treated as empty if no visible text content |
| Media Picker (multiple)   | Array converted to JSON for use with count filter                  |
| Content Picker (multiple) | Array converted to JSON for use with count filter                  |
| Block List / Block Grid   | `contentData` array extracted for use with count filter            |
| Any other type            | `ToString()` called on the value                                   |

---

## TestSite

The solution includes a fully configured Umbraco test site at `samples/OC.UFMFallbacks.Testsite` so you can try out every filter and fallback combination locally.

### Running the TestSite

1. **Build and run** the TestSite project:

   ```bash
   dotnet run --project samples/OC.UFMFallbacks.Testsite
   ```

2. **Log in** to the Umbraco backoffice at `https://localhost:<port>/umbraco`:

   |              |                     |
   | ------------ | ------------------- |
   | **Email**    | `admin@example.com` |
   | **Password** | `1234567890`        |

### Test content & uSync

The TestSite ships with [uSync](https://jumoo.co.uk/usync/) installed. All document types and test content are stored as uSync export files under `samples/OC.UFMFallbacks.Testsite/uSync/`. When the site starts for the first time, uSync will automatically import the schema and content so you have everything ready to go — no manual setup needed.

If you need to re-import at any time, open the **uSync** dashboard in the backoffice Settings section and click **Import All**.

---

## Contributing

Issues and pull requests are welcome at [github.com/OwainWilliams/OC.UFMFallbacks](https://github.com/OwainWilliams/OC.UFMFallbacks).

---

## License

MIT © Owain Williams
