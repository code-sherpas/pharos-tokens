---
'@code-sherpas/pharos-tokens': major
---

Removes the tokens deprecated since 0.6.0 and 0.8.0. Neither pharos-react nor Alexandria uses them.

- The nine `z.*` layers from before decision D29 (`--pharos-z-0`, `-header`, `-above-header`, `-modal-overlay`, `-modal`, `-drawer-overlay`, `-drawer`, `-dropdown`, `-tooltip`, and their `PharosZ…` constants). Use `--pharos-z-index-*` (`zIndex.*`): `base`, `sticky`, `overlay`, `modal`, `popover`, `toast`, `tooltip`.
- `type.lesson-title` (`--pharos-type-lesson-title-*`, `PharosTypeLessonTitle…`). Use `--pharos-type-h4-*` (`type.h4`), the same style.
