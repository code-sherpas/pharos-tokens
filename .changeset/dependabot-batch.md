---
'@code-sherpas/pharos-tokens': patch
---

Batch major-version bumps of dev dependencies:

- `style-dictionary` 4 → 5 (also surfaces 17 previously-hidden tokens as CSS vars: `--pharos-font-family-*`, `--pharos-font-weight-*`, `--pharos-font-line-height-*`, `--pharos-font-letter-spacing-*`, `--pharos-easing-*`).
- `typescript` 5 → 6.
- `eslint` 9 → 10.
- `eslint-config-prettier` 9 → 10.
- `@types/node` 22 → 25.
- GitHub Action `pnpm/action-setup` v5 → v6.

No token values or naming change. Consumers gain access to font and easing tokens via CSS without any code change on their side.
