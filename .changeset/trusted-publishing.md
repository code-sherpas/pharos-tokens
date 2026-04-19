---
'@code-sherpas/pharos-tokens': patch
---

Publishes are now signed with npm provenance (sigstore attestation) and authenticated via Trusted Publishing (OIDC) instead of a long-lived token.

Consumers can verify the origin of any release with `npm audit signatures`.

No runtime or API changes.
