---
'@code-sherpas/pharos-tokens': patch
---

Clean up `.npmrc`: drop `strict-peer-dependencies=false` and `auto-install-peers=true`. Both are pnpm-only keys that npm CLI logged as "Unknown project config" warnings in release logs, and pnpm 9+ already defaults to `auto-install-peers=true`. Removing them is safe (install + lockfile remain stable with the existing `pnpm.overrides`), leaving only one unavoidable pnpm-specific key (`minimum-release-age=7`).
