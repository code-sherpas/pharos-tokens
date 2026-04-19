# @code-sherpas/pharos-tokens

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
