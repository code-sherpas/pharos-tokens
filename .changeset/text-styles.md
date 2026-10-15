---
'@code-sherpas/pharos-tokens': minor
---

Text styles. The design system artifact's eight text styles (`display`, `h1`, `h2`, `h3`, `lesson-title`, `subtitle`, `body`, `caption`) are published as DTCG typography tokens under `type.*`, built from the existing font primitives where they match (`{font.size.4xl}`, `{font.weight.bold}`, …).

In CSS each property is its own custom property, because the `font` shorthand would drop letter-spacing:

```css
.title {
  font-family: var(--pharos-type-h1-font-family);
  font-size: var(--pharos-type-h1-font-size);
  font-weight: var(--pharos-type-h1-font-weight);
  line-height: var(--pharos-type-h1-line-height);
  letter-spacing: var(--pharos-type-h1-letter-spacing);
}
```

In JS: `tokens.type.h1.fontSize`, and the DTCG source keeps the composite (`@code-sherpas/pharos-tokens/dtcg/typography`). `sync-from-artifact` now compares text styles too.
