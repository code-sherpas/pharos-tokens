# pharos-tokens

Design tokens for Code Sherpas, published as `@code-sherpas/pharos-tokens`.
**Technology-agnostic package**: no React, no Tailwind, no framework
dependencies. Consumable from any frontend (React, Vue, Svelte,
React Native) and from backends (transactional emails, PDFs, reports).

## Stack

- Single-package repo (pnpm)
- TypeScript (only to type the outputs)
- Style Dictionary v4 (DTCG → CSS + JS compiler)
- DTCG format (Design Tokens Community Group)
- OKLCH colors
- Vitest (WCAG contrast, DTCG format, CSS output)
- Changesets

## Philosophy

pharos-tokens is the **single source of truth** for Code Sherpas's atomic
visual decisions. Anything with a value (color, spacing, radius, typography,
shadow, animation, z-index) lives here. Components (in `pharos-react`) and
apps (`alexandria-*`) consume it, not the other way around.

Principles:

1. **Framework-agnostic.** Zero dependencies on React, Vue, etc.
2. **Consumable in plain HTML.** A transactional email or a server-generated
   PDF must be able to use the CSS vars as-is.
3. **Independent versioning.** pharos-tokens has its own semver;
   pharos-react declares which token versions it supports.
4. **Validated accessibility.** Every color/on-color pair passes
   WCAG 2.1 AA in CI.

## NON-NEGOTIABLE rules

1. **DTCG format.** Every declared token follows the DTCG spec with `$value`,
   `$type`, `$description`.
2. **OKLCH colors.** No hex, no RGB. OKLCH is perceptually uniform and makes
   it easy to generate consistent scales.
3. **`pharos-` prefix in naming.** Every output CSS var is prefixed
   `--pharos-` to avoid collisions.
4. **Contrast tests in CI.** A PR cannot merge if any color/on-color pair
   fails WCAG 2.1 AA.
5. **Valid references.** If a token references another one
   (`{color.base.white}`), the referenced token must exist. CI validates it.
6. **Changeset required.** Breaking change = major (rename/remove). New token
   = minor. Value tweak without renaming = patch.
7. **No components or UI styles.** This package defines values, not visual
   structures. If someone proposes adding a component, it goes into
   `pharos-react`.
8. **No runtime dependencies.** Only `devDependencies`. The published output
   is data + types, never third-party executable code.

## Build outputs

`pnpm build` generates the following in `dist/`:

- `styles.css` — CSS custom properties prefixed `--pharos-*` (canonical, multi-framework).
- `tokens.js` — flat ESM constants (`PharosColorNeutral900`, etc.) for selective imports.
- `tokens.d.ts` — TypeScript types for the flat constants.
- `tokens.json` — nested values-only object (for tools that process tokens generically).
- `index.js` — friendly barrel with the nested object (`tokens.color.neutral['900']`).
- `index.d.ts` — types for the barrel (autocomplete by path).

The raw DTCG source files (`src/*.tokens.json`) are exposed via the `./dtcg/*`
subpath for advanced consumers that transform them with their own tools
(e.g. iOS/Android token pipelines).

## Workflow to update a token

See skill `update-token` in `.skills/update-token.md`.

## Workflow to introduce a new category

See skill `add-token-category` in `.skills/add-token-category.md`.

## Source of the values

The current tokens are derived from the Alexandria analysis documented in
`alexandria-web-application:feat/fase-0-analysis/ANALYSIS-tokens.md` and from
the architectural decisions approved in the plan
(`PLAN-pharos-alexandria.md`, Fase 0 checkpoint, 2026-04-19).

**Adjustments vs Alexandria** for WCAG compliance:

- `color.semantic.success.fg` and `color.semantic.info.fg` are darker
  versions of the Alexandria values (`#05b661`, `#009bf9`) so that they
  pass AA 4.5:1 against a white background. The original Alexandria values
  failed.

## Expected MCP servers

This repo has `.mcp.json` with: `context7`, `github`. **It does not include
the shadcn MCP** — this repo does not deal with components.

**When to use each one:**

- **`context7`** → live documentation for Style Dictionary v4, the DTCG spec
  (Design Tokens Community Group), the OKLCH color space, TypeScript,
  culori. Use it before modifying the Style Dictionary config or when you
  need to confirm that a transform/format follows the current API.
- **`github`** → issues, PRs, releases. Use it to reference consumer issues
  (e.g. "pharos-react needs token `radius.full`") or when opening PRs.

## Useful commands

- `pnpm build` — compile DTCG to CSS + JS + types
- `pnpm test` — Vitest suite (WCAG contrast, DTCG format, CSS output)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm changeset` — create a changeset
- `pnpm release` — (CI only) build + publish to npm
- `node scripts/compute-oklch.mjs` — helper to convert Alexandria hex values to OKLCH
