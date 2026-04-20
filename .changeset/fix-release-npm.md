---
'@code-sherpas/pharos-tokens': patch
---

Fix the release workflow: upgrade the CI runner's npm to the latest (>= 11.5.1) before publishing. Node 22 LTS ships with npm 10.x, which signs provenance attestations but cannot complete the OIDC handshake required by npm Trusted Publishing. Without the upgrade `pnpm release` fails with a misleading `404 Not Found` even when the Trusted Publisher is correctly configured on npmjs.com.
