---
'@code-sherpas/pharos-tokens': patch
---

Upgrade CI runners and local-dev pinning to Node 24.15.0 LTS (Krypton). Node 24 ships with npm 11.7+, which implements the OIDC handshake required by npm Trusted Publishing natively — no manual `npm install -g npm@latest` workaround needed.

`package.json` engines remains at `node: ">=22"` so consumers that still run on Node 22 (e.g. Alexandria) are not forced to upgrade.
