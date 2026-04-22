# Rules for consumers of `@code-sherpas/pharos-tokens`

This file ships with the package (`files` includes `RULES.md`). Every
consumer — `pharos-react`, `alexandria-web-application`, `alexandria-design`,
and any future app — must follow these rules.

## 1. Do not redefine values locally

Tokens are the single source of truth. Forbidden:

- Hardcoded hex for colors that have an equivalent token (e.g. `#101820` when `--pharos-color-neutral-900` exists).
- Raw `rem`/`px` values for spacing when `--pharos-spacing-*` exists.
- Ad-hoc local shadows.

If a value has no token, open an issue in this repo. Do not improvise.

## 2. Do not invent colors outside the system

The system is: `color.neutral.*`, `color.primary.*`, `color.semantic.{success,error,warning,info}.*`, `color.base.{white,black}`. If you need a new accent (purple, amber, etc.) with clear semantics, open an issue — do not add it locally.

## 3. Use CSS vars or the JS object

**Web**: import `@code-sherpas/pharos-tokens/css` at your entry point and use `var(--pharos-*)` or Tailwind arbitrary values (`bg-[var(--pharos-color-primary-600)]`).

**Programmatic** (JS/TS): `import { tokens } from '@code-sherpas/pharos-tokens'` → `tokens.color.neutral['900']`.

**DTCG source** (for custom pipelines): `import dtcg from '@code-sherpas/pharos-tokens/dtcg/color'`.

## 4. Do not mutate values after importing

Forbidden: `tokens.color.primary['600'] = '#new'`. The object is frozen in spirit even if JS does not enforce it. Changes go through a PR to this repo.

## 5. Respect semver

- Breaking change in this repo → major bump → consumers upgrade explicitly.
- New token → minor bump → consumers may adopt without breaking anything.
- Value adjustment without renaming → patch → consumers receive visual improvements automatically.

## 6. Accessibility

When picking which tokens to use, respect the defined pairs:

- Text over `color.neutral.50`/`100`/`200`: use `color.neutral.900` or darker.
- Text over `color.primary.600`+: use `color.base.white`.
- Text over `color.semantic.{success,error,info}.fg` (filled): use `.on` from the same group.
- Text over `color.semantic.warning.fg`: `.on` is `color.neutral.900` (warning is light).

## 7. Extensions and overrides

**Do not** publish a new package `@yourorg/pharos-tokens-extended`. If a product needs its own tokens (e.g. co-branded identities), implement them as additional CSS vars in the consumer under your own namespace (`--myapp-*`) and document it.

## 8. Font loading is the consumer's responsibility

`pharos-tokens` declares the font stack (e.g. `"Outfit", Inter, system-ui, ...`) but does **not** ship font files. The package stays framework-agnostic and cannot assume how the consumer serves assets. Each consumer is responsible for loading the primary face before the UI renders:

- **Next.js**: `next/font/google` with `Outfit` (and optionally `Inter`) in the root layout.
- **Vite / CRA / generic web**: `@fontsource/outfit` + `@fontsource/inter`, or a `<link>` tag to Google Fonts.
- **Emails / PDFs**: the renderer falls back through the stack; declare `Outfit` as the primary face only if the renderer can embed it, otherwise the fallback chain kicks in.

If the primary face is not loaded, the stack falls back through `Inter → system-ui → ...`, so the UI degrades gracefully — but the intended design requires the primary face.
