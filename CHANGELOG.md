# @code-sherpas/pharos-tokens

## 1.0.0

### Major Changes

- a3ce7fd: Removes the tokens deprecated since 0.6.0 and 0.8.0. Neither pharos-react nor Alexandria uses them.

  - The nine `z.*` layers from before decision D29 (`--pharos-z-0`, `-header`, `-above-header`, `-modal-overlay`, `-modal`, `-drawer-overlay`, `-drawer`, `-dropdown`, `-tooltip`, and their `PharosZ…` constants). Use `--pharos-z-index-*` (`zIndex.*`): `base`, `sticky`, `overlay`, `modal`, `popover`, `toast`, `tooltip`.
  - `type.lesson-title` (`--pharos-type-lesson-title-*`, `PharosTypeLessonTitle…`). Use `--pharos-type-h4-*` (`type.h4`), the same style.

## 0.8.1

### Patch Changes

- 48b4baa: The package no longer ships `RULES.md`: the rules for consumers now live in Notion (decision D27), linked from the README. The tokens and every export are unchanged.

## 0.8.0

### Minor Changes

- fa06834: New text style `--pharos-type-h4-*` (xl, 600, tight), from the Pharos design system artifact. `--pharos-type-lesson-title-*` is the same style under one product's name: it stays published, marked deprecated, and is removed in the next major — use `--pharos-type-h4-*`. The seablue ramp's descriptions say "AI" instead of "AI/copilot". Snapshot refreshed from artifact version `1792106120-16ce`.

## 0.7.0

### Minor Changes

- fcca5b2: Text styles. The design system artifact's eight text styles (`display`, `h1`, `h2`, `h3`, `lesson-title`, `subtitle`, `body`, `caption`) are published as DTCG typography tokens under `type.*`, built from the existing font primitives where they match (`{font.size.4xl}`, `{font.weight.bold}`, …).

  In CSS each property is its own custom property, because the `font` shorthand would drop letter-spacing:

  ```css
  .title {
    font-family: var(--pharos-type-h1-font-family);
    font-size: var(--pharos-type-h1-font-size);
    font-weight: var(--pharos-type-h1-font-weight);
    line-height: var(--pharos-type-h1-line-height);
    letter-spacing: var(--pharos-type-h1-letter-spacing);
  }
  ```

  In JS: `tokens.type.h1.fontSize`, and the DTCG source keeps the composite (`@code-sherpas/pharos-tokens/dtcg/typography`). `sync-from-artifact` now compares text styles too.

## 0.6.0

### Minor Changes

- 70bbe47: Tokens follow the Pharos design system artifact, which is now their source of truth (decision D23). `scripts/sync-from-artifact.ts` compares `src/` with a snapshot of the artifact kept in `artifact/`, and a test fails while they disagree.

  What changes for consumers:

  - **New z-index scale, by role (decision D29):** `--pharos-z-index-base` (0), `-sticky` (1100), `-overlay` (1300), `-modal` (1400), `-popover` (1500), `-toast` (1700), `-tooltip` (1800). `pharos-react` already reads `--pharos-z-index-popover`, which until now no version published.
  - **Deprecated:** every `--pharos-z-*` (`z-0`, `z-header`, `z-above-header`, `z-modal-overlay`, `z-modal`, `z-drawer-overlay`, `z-drawer`, `z-dropdown`, `z-tooltip`). They keep their values and are removed in the next major; each one's comment names its replacement.
  - **The neutral ramp is now tints of navy** (hue 248.83, chroma growing from 0.003 to 0.0225) instead of pure grey from 50 to 600. The step that moves most is `neutral-800`, which was lighter than `neutral-700` and is now darker: `oklch(37.05% 0.0436 247.87)` → `oklch(24.5% 0.02 248.83)`. Expect a slightly cooler grey everywhere, and a darker 800.
  - **Semantic colors with less chroma:** `success-fg`/`-bg` (0.17 → 0.136), `info-fg`/`-bg` (0.17 → 0.133), `error-fg-hover` (0.205 → 0.191), `error-fg-active` (0.175 → 0.162). Same lightness; their `-on` pairs still pass the WCAG AA tests.
  - **Descriptions** of every token now repeat the artifact's usage notes.

## 0.5.0

### Minor Changes

- 9d70948: Añade cuatro familias de color que el sistema de diseño ya usa y los tokens no publicaban: `paper` (el papel cálido sobre el que se apoyan las superficies), `rule` (las líneas), los alias semánticos `surface.{canvas,card,sunken}` y `border.{subtle,strong}`, y la rampa completa `accent.terracotta.50…900` con sus alias `fg` / `bg` / `on`.

  Todo es aditivo: ningún token existente cambia de nombre ni de valor, así que un consumidor que actualice no ve moverse un solo píxel hasta que decida nombrar los nuevos.

## 0.4.0

### Minor Changes

- 0d202cf: Flip default sans-serif family to Outfit-first + Inter fallback (Decision D8) and relax `engines.node` from `>=24` to `>=22` to unblock consumers that run Node 22 (e.g. `alexandria-web-application`). The primary-face loading stays on the consumer side — see RULES.md §8 for Next.js, Vite and email/PDF setups.

## 0.3.0

### Minor Changes

- 762be3b: rebalance `color.semantic.error.*` shades for WCAG AA 4.5:1 on filled buttons

  Alexandria's original `#ef2828` — inherited as `error.fg` through 0.2.x —
  has contrast 4.19 vs white, which fails WCAG AA 4.5:1 for normal text.
  pharos-react's Button destructive variant (14px regular-weight white
  label on the red fill) tripped this in Chromatic a11y. Same precedent
  as `success.fg` and `info.fg`, which were already darkened from their
  Alexandria originals for the same reason in earlier releases.

  This release shifts the whole `error.*` scale one step darker so the
  rest state clears AA 4.5:1 and the hover / active states remain
  distinct and monotonically darker:
  - `error.fg`: `oklch(54% 0.22 27.48)` — was `oklch(61.28% 0.2305 27.48)`.
    Contrast vs white goes from 4.19 → 5.68.
  - `error.fg-hover`: `oklch(47% 0.205 27.48)` — was `oklch(54% 0.22 27.48)`.
    Contrast vs white 7.26, passes AA 4.5:1 with margin.
  - `error.fg-active`: `oklch(40% 0.175 27.48)` — was `oklch(46% 0.195 27.48)`.
    Contrast vs white 9.69, passes AAA 7:1.
  - `error.bg`: 6.3%-alpha tint tracks the new `fg` value so the
    subtle-background relationship stays consistent with the fill color.

  ### WCAG test matrix tightened

  The test case for `error.fg` vs `on` now asserts against `AA_NORMAL`
  (4.5:1), not `AA_LARGE` (3:1). Same change applied to `success.fg` and
  `info.fg`, since their values already passed AA normal — this locks
  in the contract so a future value tweak can't silently regress it.

  `warning.fg` stays on `AA_LARGE` (3:1) because its paired `on` is
  `neutral-900` (dark text on light amber). Passing AA normal there would
  force the amber darker than any usable amber colour — industry
  convention (Material, Carbon, Primer) is to accept AA large for
  warning surfaces when combined with icons / heavier weight.

  ### Visual migration impact

  Alexandria's dominant red shifts from bright `#ef2828` toward a darker,
  more serious-looking red (`#d00113`). This is the "DS quality above
  current-Alexandria visual fidelity" principle applied: the WCAG
  violation in Alexandria's red is fixed systemically in Pharos rather
  than papered over per-component.

## 0.2.0

### Minor Changes

- 70a1695: add interactive state shades for `color.semantic.error`

  Pharos previously exposed a single error color (`fg`) plus its subtle
  background (`bg`) and on-color (`on`). Interactive surfaces built with
  `fg` had no darker shade to fall back on for `:hover` / `:active`,
  which pushed consumers toward opacity or filter workarounds — neither
  of which produce a proper darker-on-hover signal on a light surface.

  This change introduces two new tokens:
  - `color.semantic.error.fg-hover` — darker shade of `fg` for hover
    states on filled destructive surfaces. Passes WCAG AA 4.5:1 against
    `error.on` (white).
  - `color.semantic.error.fg-active` — darker still, for pressed /
    active states. Passes WCAG AAA 7:1 against `error.on`.

  The new tokens emit as `--pharos-color-semantic-error-fg-hover` and
  `--pharos-color-semantic-error-fg-active`. Existing tokens are
  unchanged, so consumers can adopt them incrementally.

  Equivalent shades for `success`, `warning` and `info` will follow when
  pharos-react ships the corresponding filled semantic buttons.

## 0.1.3

### Patch Changes

- ce0b669: Clean up `.npmrc`: drop `strict-peer-dependencies=false` and `auto-install-peers=true`. Both are pnpm-only keys that npm CLI logged as "Unknown project config" warnings in release logs, and pnpm 9+ already defaults to `auto-install-peers=true`. Removing them is safe (install + lockfile remain stable with the existing `pnpm.overrides`), leaving only one unavoidable pnpm-specific key (`minimum-release-age=7`).

## 0.1.2

### Patch Changes

- 09c4c7a: Upgrade CI runners and local-dev pinning to Node 24.15.0 LTS (Krypton). Node 24 ships with npm 11.7+, which implements the OIDC handshake required by npm Trusted Publishing natively — no manual `npm install -g npm@latest` workaround needed.

  `package.json` engines remains at `node: ">=22"` so consumers that still run on Node 22 (e.g. Alexandria) are not forced to upgrade.

## 0.1.1

### Patch Changes

- 81e54f0: Publishes are now signed with npm provenance (sigstore attestation) and authenticated via Trusted Publishing (OIDC) instead of a long-lived token.

  Consumers can verify the origin of any release with `npm audit signatures`.

  No runtime or API changes.

## 0.1.0

### Minor Changes

- aa3194a: Initial release — tokens extracted from Alexandria and normalized per Fase 0 analysis.

  **Highlights:**
  - Full color scale in OKLCH: `color.neutral.{50..950}`, `color.primary.{50..900}`, `color.semantic.{success,error,warning,info}.{fg,bg,on}`, `color.base.{white,black}`.
  - Spacing aligned with the Tailwind default (`spacing.0` through `spacing.24`), removing Alexandria's redundant `cs-*` scale per decision D1.
  - Radius scale using the Tailwind default plus `radius.full` (117 usages in Alexandria).
  - Typography with `font.size.sm` (14px) as the body default per decision D3.
  - Z-index scale preserving Alexandria's semantic levels (`header`, `modal`, `drawer`, `dropdown`, `tooltip`).
  - Duration (`fast`/`normal`/`slow`) and easing (`in`/`out`/`in-out`) normalized from Alexandria's ad-hoc durations.

  **WCAG adjustments vs Alexandria source:**
  - `color.semantic.success.fg` darkened from `#05b661` (L=68%, failed AA) to `oklch(52% 0.17 152)` to pass WCAG AA 4.5:1 against white.
  - `color.semantic.info.fg` darkened from `#009bf9` (L=67%, failed AA) to `oklch(52% 0.17 246)` for the same reason.

  **Decisions applied** (see `PLAN-pharos-alexandria.md` Fase 0 checkpoint):
  - D1: no duplicated `cs-*` scales.
  - D2: single red (`color.semantic.error.fg`), no `laser-red` distinction.
  - D3: body typography = 14px.
  - D6: no legacy deprecated tokens included.

### Patch Changes

- bc0691e: Batch major-version bumps of dev dependencies:
  - `style-dictionary` 4 → 5 (also surfaces 17 previously-hidden tokens as CSS vars: `--pharos-font-family-*`, `--pharos-font-weight-*`, `--pharos-font-line-height-*`, `--pharos-font-letter-spacing-*`, `--pharos-easing-*`).
  - `typescript` 5 → 6.
  - `eslint` 9 → 10.
  - `eslint-config-prettier` 9 → 10.
  - `@types/node` 22 → 25.
  - GitHub Action `pnpm/action-setup` v5 → v6.

  No token values or naming change. Consumers gain access to font and easing tokens via CSS without any code change on their side.

- 2eabbcb: Fix two moderate transitive CVEs reached via vitest:
  - `esbuild` ≤ 0.24.2 (dev-server request forgery, GHSA-67mh-4wv8-2f99) → pinned to `^0.25.0` via pnpm overrides.
  - `vite` ≤ 6.4.1 (path traversal in optimized deps `.map`, GHSA-4w7w-66w2-5vf9) → pinned to `^7.0.0` via pnpm overrides.

  Bumped `vitest` 2.1.9 → 4.1.4 along the way. Test suite (22 cases) still passes.

  No runtime impact on the published package — pharos-tokens has zero runtime dependencies. This only affects the dev/test loop.
