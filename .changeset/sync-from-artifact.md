---
'@code-sherpas/pharos-tokens': minor
---

Tokens follow the Pharos design system artifact, which is now their source of truth (decision D23). `scripts/sync-from-artifact.ts` compares `src/` with a snapshot of the artifact kept in `artifact/`, and a test fails while they disagree.

What changes for consumers:

- **New z-index scale, by role (decision D29):** `--pharos-z-index-base` (0), `-sticky` (1100), `-overlay` (1300), `-modal` (1400), `-popover` (1500), `-toast` (1700), `-tooltip` (1800). `pharos-react` already reads `--pharos-z-index-popover`, which until now no version published.
- **Deprecated:** every `--pharos-z-*` (`z-0`, `z-header`, `z-above-header`, `z-modal-overlay`, `z-modal`, `z-drawer-overlay`, `z-drawer`, `z-dropdown`, `z-tooltip`). They keep their values and are removed in the next major; each one's comment names its replacement.
- **The neutral ramp is now tints of navy** (hue 248.83, chroma growing from 0.003 to 0.0225) instead of pure grey from 50 to 600. The step that moves most is `neutral-800`, which was lighter than `neutral-700` and is now darker: `oklch(37.05% 0.0436 247.87)` → `oklch(24.5% 0.02 248.83)`. Expect a slightly cooler grey everywhere, and a darker 800.
- **Semantic colors with less chroma:** `success-fg`/`-bg` (0.17 → 0.136), `info-fg`/`-bg` (0.17 → 0.133), `error-fg-hover` (0.205 → 0.191), `error-fg-active` (0.175 → 0.162). Same lightness; their `-on` pairs still pass the WCAG AA tests.
- **Descriptions** of every token now repeat the artifact's usage notes.
