# @publira/design-tokens

The visual language shared by the Publira Organization's web projects — the website, epub-web, comic-viewer, and whatever comes next — as [Tailwind CSS v4](https://tailwindcss.com/) theme variables.

> This package extends Tailwind CSS's design system rather than replacing it.

It provides semantic color tokens and the Japanese-aware font stacks, and nothing else: element styles, layout, and components belong to each application. Spacing, sizes, radii, shadows, the type scale, and breakpoints stay Tailwind's own.

The tokens are written in the [Design Tokens Format Module](https://www.designtokens.org/tr/drafts/format/) (DTCG, 2025.10) under `tokens/`, which is the source of truth. [Style Dictionary](https://styledictionary.com/) turns them into the `theme.css` that Tailwind reads.

## Requirements

Tailwind CSS v4. The CSS uses `@theme` and `@layer`, which Tailwind v3 does not understand. The package ships no JavaScript; `theme.css` is generated when the package is published, so consumers need no build step of their own.

## Installation

```sh
pnpm add -D @publira/design-tokens
```

## Usage

Import it after Tailwind:

```css
@import "tailwindcss";
@import "@publira/design-tokens/theme.css";
```

Then use the semantic roles as ordinary Tailwind utilities:

```html
<div class="bg-background text-foreground">
  <button class="bg-primary text-primary-foreground">…</button>
</div>
```

Tools other than Tailwind — a design tool, a native app, an email template — can read the DTCG files directly:

```js
import color from "@publira/design-tokens/tokens/color.tokens.json" with { type: "json" };
```

`theme.css` contains `@theme` variables only. It adds utilities (`bg-primary`, `font-serif`, …) and changes nothing until one of them is used — except `--font-sans`, which Tailwind's preflight applies to the whole document (see Typography).

As with any Tailwind theme variable, a `--color-*` variable is only emitted when a utility or a `var()` in your CSS refers to it. Read one from outside CSS — an inline `style`, a canvas — and you need `@theme static` or a reference of your own in the stylesheet.

## Tokens

### Color

Defined in `tokens/color.tokens.json` as `$type: "color"` tokens in the sRGB color space, each with its `hex`.

Each role that paints a fill comes with a `-foreground` for the text and icons on top of it. Every such pair has a contrast ratio of at least 4.5:1.

| Token | Value | Use |
| --- | --- | --- |
| `--color-background` / `--color-foreground` | `#f5f5f2` / `#1f1d1a` | The page and the text set directly on it |
| `--color-surface` / `-foreground` | `#fafaf8` / `#1f1d1a` | An area raised slightly off the page: a section, a panel |
| `--color-card` / `-foreground` | `#ffffff` / `#1f1d1a` | A card |
| `--color-popover` / `-foreground` | `#ffffff` / `#1f1d1a` | A floating layer: popover, menu, dialog, toast |
| `--color-primary` / `-foreground` | `#2b4c8c` / `#ffffff` | Ai (indigo): the main action, links, selected state |
| `--color-secondary` / `-foreground` | `#c63d17` / `#ffffff` | Shu (vermilion): the second brand color, used sparingly |
| `--color-accent` / `-foreground` | `#e3e9f5` / `#22407a` | A quiet highlight: hover, the current item |
| `--color-muted` / `-foreground` | `#e8e8e3` / `#5f5e59` | A subdued fill; the foreground is also secondary text |
| `--color-border` | `#d6d6d0` | Hairlines and dividers |
| `--color-input` | `#cfcfc8` | The edge of a form control |
| `--color-ring` | `#2b4c8c` | The focus indicator |
| `--color-success` / `-foreground` | `#2a6b3f` / `#ffffff` | Success |
| `--color-warning` / `-foreground` | `#8a5a0b` / `#ffffff` | Warning |
| `--color-destructive` / `-foreground` | `#8f1d1d` / `#ffffff` | Errors and actions that destroy data |
| `--color-info` / `-foreground` | `#2f5d8a` / `#ffffff` | Neutral information |

`secondary` is a brand color, not the subdued "secondary button" some component libraries mean by the name. For a quiet fill, use `muted` or `accent`.

Tailwind's own palette (`blue-700`, `stone-200`, …) remains available, but reach for a role first: a role says what a color is for, and survives a palette change.

### Typography

Defined in `tokens/font.tokens.json` as `$type: "fontFamily"` tokens.

| Token | Stack | Utility |
| --- | --- | --- |
| `--font-sans` | `"Hiragino Sans", "BIZ UDPGothic", "Yu Gothic", "Noto Sans CJK JP", "Noto Sans JP", system-ui, sans-serif` | `font-sans` |
| `--font-serif` | `"Hiragino Mincho ProN", "BIZ UDPMincho", "Yu Mincho", "Noto Serif CJK JP", "Noto Serif JP", serif` | `font-serif` |

Both stacks name only faces already installed on the reader's platform — macOS and iOS, Windows, then Linux and Android — so no web font is downloaded. Tailwind's preflight sets `font-sans` on `html`, so replacing `--font-sans` changes the default text face of the whole document.

`--font-mono`, font sizes, weights, line heights, and letter spacing are Tailwind's defaults.

## What is not here, and why

Tailwind's default theme is a complete, well-tested design system, and redefining it would only give consumers two of each. So this package does not touch:

- spacing and sizing
- border radius
- font size, weight, line height, letter spacing
- breakpoints and containers
- shadows, blur, easing, animation

It also does not publish a primitive palette (`ai-700`, `shu-500`, …). Consumers use roles; the concrete colors behind them are an implementation detail.

## Adding a token

Add a token when **all** of these hold:

1. **More than one Publira project needs it**, with the same meaning and the same appearance. One application needing a value is a reason to put it in that application's CSS, not here.
2. **Tailwind has nothing that already does the job.** A new radius or shadow needs a Publira-specific reason — a rule the projects share — not a preference for a different number.
3. **It is named for its role, not its value.** `--color-warning`, not `--color-amber`.
4. **It fits an existing Tailwind namespace** (`--color-*`, `--font-*`, …) so it produces utilities without any configuration.

To add or change one, edit the files in `tokens/` — never the generated `dist/theme.css` — and check the result:

```sh
pnpm build   # tokens/*.tokens.json → dist/theme.css
pnpm test    # builds, then compiles the output with Tailwind and validates the token files
pnpm check   # lint and format with Ultracite (`pnpm fix` to apply fixes)
```

A token's path becomes its variable name: `color` › `primary-foreground` is `--color-primary-foreground`, and so `bg-primary-foreground`. Keep names flat inside a group, as the existing ones are.

Everything a single application decides — layout widths, component styles, hero sizes, background art — stays in that application.

## Versioning

This package follows [Semantic Versioning](https://semver.org/). Because the output is visual, a change that alters what users see is never a patch: a consumer should see it in the version number before they see it in a screenshot diff.

| Release | When |
| --- | --- |
| **Patch** | No visual change: documentation, metadata, packaging, a `$description`, the build tooling |
| **Minor** | A new token; a changed color or font stack that keeps its meaning |
| **Major** | A token removed or renamed; a role whose meaning changes; a change to the token file layout; anything that requires consumers to edit their code |

## License

[Apache License 2.0](./LICENSE)
