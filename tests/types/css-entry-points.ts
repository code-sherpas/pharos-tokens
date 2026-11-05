// Type-only check, run by `pnpm typecheck` (not by Vitest): a consumer's
// TypeScript must resolve both stylesheet entry points with
// `noUncheckedSideEffectImports`, on by default since TypeScript 6. The imports
// self-reference this package, so they go through its `exports` map exactly as
// they do in a consumer.
import '@code-sherpas/pharos-tokens/styles.css';
import '@code-sherpas/pharos-tokens/css';
