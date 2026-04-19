---
'@code-sherpas/pharos-tokens': minor
---

Initial release — tokens extracted from Alexandria and normalized per Fase 0 analysis.

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
