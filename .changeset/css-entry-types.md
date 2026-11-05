---
'@code-sherpas/pharos-tokens': patch
---

The stylesheet now type-checks as a side-effect import. TypeScript 6 and later check side-effect imports by default (`noUncheckedSideEffectImports`), and `import '@code-sherpas/pharos-tokens/css'` failed with TS2882 because the entry point shipped no declarations. Both stylesheet entry points now carry a `types` condition pointing to an empty `styles.css.d.ts`, so no consumer needs a `declare module` or has to turn the check off.

It also adds `@code-sherpas/pharos-tokens/styles.css`, the same stylesheet under a name that ends in `.css`, like `@code-sherpas/pharos-react/styles.css`. `@code-sherpas/pharos-tokens/css` keeps working unchanged.
