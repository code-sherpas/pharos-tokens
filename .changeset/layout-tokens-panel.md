---
'@code-sherpas/pharos-tokens': minor
---

Add the first layout tokens, named by role (decision D32), for Sheet and the coming SidePanel:

- `--pharos-width-panel` (`tokens.width.panel`): `24rem`, the width of an edge-docked panel.
- `--pharos-breakpoint-panel` (`tokens.breakpoint.panel`): `64rem` (1024px), the viewport width from which a SidePanel sits inline beside the content. A custom property does not work inside `@media`, so read it from the `tokens` object in JS, for example with `matchMedia(\`(min-width: ${tokens.breakpoint.panel})\`)`.

Breakpoints are now Pharos tokens, but only by role, and one is added when a component needs it: there is no generic `sm`/`md`/`lg` scale.
