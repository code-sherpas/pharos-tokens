---
'@code-sherpas/pharos-tokens': minor
---

Add `--pharos-breakpoint-compact` (`tokens.breakpoint.compact`): `40rem` (640px), the viewport width below which the window is compact, a phone (the compact window class of Material 3). It is the only phone criterion in Pharos, so an application that needs one for its own screens uses the same one as the components. A custom property does not work inside `@media`, so read it from the `tokens` object in JS, for example with `matchMedia(\`(width < ${tokens.breakpoint.compact})\`)`.
