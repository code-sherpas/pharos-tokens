---
'@code-sherpas/pharos-tokens': minor
---

rebalance `color.semantic.error.*` shades for WCAG AA 4.5:1 on filled buttons

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
