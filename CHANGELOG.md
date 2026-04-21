# @code-sherpas/pharos-tokens

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
