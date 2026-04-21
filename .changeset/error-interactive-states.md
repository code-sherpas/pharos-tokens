---
'@code-sherpas/pharos-tokens': minor
---

add interactive state shades for `color.semantic.error`

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
