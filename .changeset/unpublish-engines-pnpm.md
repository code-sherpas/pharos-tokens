---
'@code-sherpas/pharos-tokens': patch
---

The published `package.json` no longer declares `engines.pnpm: "10.33.0"`. It told consumers the package installs only with that exact pnpm, which was never true. It was meant for this repository's contributors, and `packageManager` already pins it for them. `engines.node` (`>=22`) is unchanged.
