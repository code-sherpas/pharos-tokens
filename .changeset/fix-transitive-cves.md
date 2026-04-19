---
'@code-sherpas/pharos-tokens': patch
---

Fix two moderate transitive CVEs reached via vitest:

- `esbuild` ≤ 0.24.2 (dev-server request forgery, GHSA-67mh-4wv8-2f99) → pinned to `^0.25.0` via pnpm overrides.
- `vite` ≤ 6.4.1 (path traversal in optimized deps `.map`, GHSA-4w7w-66w2-5vf9) → pinned to `^7.0.0` via pnpm overrides.

Bumped `vitest` 2.1.9 → 4.1.4 along the way. Test suite (22 cases) still passes.

No runtime impact on the published package — pharos-tokens has zero runtime dependencies. This only affects the dev/test loop.
