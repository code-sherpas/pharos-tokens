---
name: review-tokens-pr
description: Use when reviewing a pharos-tokens PR. Exhaustive checklist covering DTCG format, WCAG contrast, canonical naming, valid references, and the presence of a changeset.
triggers:
  - 'review this PR'
  - 'review pharos-tokens pr'
  - 'review token pr'
---

# Review a pharos-tokens PR

Checklist ordered by priority. If any of the first five items fail, the PR does not merge without correction.

## 1. DTCG format

- [ ] Every token has `$value`, `$type`, `$description`.
- [ ] `$type` matches the value (e.g. `color` for OKLCH strings, `dimension` for `rem`/`px`, `duration` for `ms`).
- [ ] The DTCG `.tokens.json` files parse without errors (valid JSON).

## 2. Naming

- [ ] Token path follows the existing hierarchy (`color.{neutral,primary,semantic.*,base}`, `spacing.*`, `radius.*`, `font.*`, `shadow.*`, `z.*`, `duration.*`, `easing.*`).
- [ ] Numeric scale for colors (50..900 or 50..950) or clear semantic (fg/bg/on).
- [ ] The CSS var output is prefixed with `--pharos-*` (automatically validated by the CSS output test).

## 3. Colors: format and contrast

- [ ] Colors are OKLCH — not hex, RGB, or HSL.
- [ ] If a new color is added, `wcag-contrast.test.ts` includes the matching fg/on pair.
- [ ] The pair passes AA: 4.5:1 (body text) or 3:1 (large/bold text).
- [ ] If the original Alexandria value failed WCAG, `$description` documents the adjustment.

## 4. References

- [ ] If `$value` is `{alias}`, the alias exists and points to the correct token.
- [ ] Test `dtcg-format.test.ts > references resolve` passes.

## 5. Changeset

- [ ] `.changeset/*.md` present for every change that affects the public API.
- [ ] Bump is correct:
  - major for renames/removals
  - minor for new tokens
  - patch for value tweaks without rename
- [ ] Changeset includes the rationale plus the expected impact on consumers.

## 6. Tests and build

- [ ] `pnpm build` generates the six expected artefacts with no new warnings.
- [ ] `pnpm test` passes the 22+ tests.
- [ ] `pnpm typecheck` and `pnpm lint` are clean.

## 7. Documentation

- [ ] If the category is new: the `README.md` table is updated, `RULES.md` is extended.
- [ ] If there is a breaking change: the PR description links to `TOKEN-migration-map.md` (or equivalent) so consumers know how to migrate.

## 8. Side effects

- [ ] No new runtime dependency (only `devDependencies` allowed).
- [ ] The `dist/` bundle does not grow meaningfully (< 10KB for the JS object).
- [ ] The output is still consumable as plain CSS (transactional email test).

## Decision

- If everything ✅ → approve and merge.
- If 1-5 fails → request changes with specific feedback.
- If 6-8 fails → commit the fix on the same branch or coordinate with the author.
