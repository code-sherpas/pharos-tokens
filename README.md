# @code-sherpas/pharos-tokens

Design tokens for Code Sherpas. Framework-agnostic. DTCG + Style Dictionary v4 + OKLCH.

## What's in this package

This package defines **the atomic values** of Code Sherpas's visual system: colors, spacing, radius, typography, shadows, z-index, duration, and easing. They are consumable from any frontend (React, Vue, Svelte, React Native) and from backends (transactional emails, PDFs, reports).

It contains no components. React components live in [`@code-sherpas/pharos-react`](https://github.com/code-sherpas/pharos-react) and consume this package as a peer dependency.

## Installation

```bash
pnpm add @code-sherpas/pharos-tokens
# or npm / yarn
```

## Usage

### Option A — CSS custom properties (recommended)

Import the CSS tokens at your app's entry point:

```css
@import '@code-sherpas/pharos-tokens/css';
```

This exposes `--pharos-*` on `:root`. Use them directly or via Tailwind arbitrary values:

```css
.button-primary {
  background: var(--pharos-color-primary-600);
  color: white;
}
```

```html
<div class="bg-[var(--pharos-color-neutral-900)] text-white p-[var(--pharos-spacing-4)]">…</div>
```

### Option B — Typed object (JS/TS)

```ts
import { tokens } from '@code-sherpas/pharos-tokens';

const darkSurface = tokens.color.neutral['900'];
const cardRadius = tokens.radius['2xl'];
```

Full autocomplete thanks to `typeof tokens`.

### Option C — Flat constants (selective imports)

```ts
import { PharosColorPrimary600, PharosRadius2xl } from '@code-sherpas/pharos-tokens/tokens.js';
```

### Option D — DTCG source (custom pipelines)

For your own transforms (iOS, Android, Figma, etc.):

```ts
import colorDtcg from '@code-sherpas/pharos-tokens/dtcg/color';
// DTCG object with $value, $type, $description
```

## Rules for consumers

See [RULES.md](./RULES.md) — published with the package.

## Token structure

| Family     | Example path                                                                           | Description                                               |
| ---------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Base       | `color.base.{white,black}`                                                             | Pure white and black.                                     |
| Neutrals   | `color.neutral.{50..950}`                                                              | Grayscale, slightly navy-tinted in the darker steps.      |
| Primary    | `color.primary.{50..900}`                                                              | Sea blue, scale 50-900. 600 is the base hue.              |
| Semantic   | `color.semantic.{success,error,warning,info}.{fg,bg,on}`                               | Success/error/warning/info. `fg + on` pairs pass WCAG AA. |
| Spacing    | `spacing.{0..24}`                                                                      | Tailwind-compatible scale in `rem`.                       |
| Radius     | `radius.{none,sm,md,lg,xl,2xl,3xl,full}`                                               | Corner rounding.                                          |
| Typography | `font.{family,weight,size,lineHeight,letterSpacing}.*`                                 | Typography. Body default = `size.sm` (14px).              |
| Shadow     | `shadow.{sm,md,lg,xl}`                                                                 | Elevation.                                                |
| Z-index    | `z.{0,header,above-header,modal-overlay,modal,drawer-overlay,drawer,dropdown,tooltip}` | Semantic, not literal.                                    |
| Duration   | `duration.{fast,normal,slow}`                                                          | Transitions.                                              |
| Easing     | `easing.{in,out,in-out}`                                                               | Cubic-bezier curves.                                      |

## Contributing

1. `pnpm install`
2. Modify or add tokens in `src/*.tokens.json` (DTCG format).
3. `pnpm build` — verify that Style Dictionary compiles.
4. `pnpm test` — WCAG + DTCG validations must pass.
5. `pnpm changeset` — declare the type of change (patch / minor / major).
6. Open a PR.

CI validates WCAG 2.1 AA contrast on every color/on-color pair. A PR cannot be merged if it breaks contrast.

## License

MIT. See [LICENSE](./LICENSE).
