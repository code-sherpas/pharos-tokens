---
'@code-sherpas/pharos-tokens': minor
---

Flip default sans-serif family to Outfit-first + Inter fallback (Decision D8) and relax `engines.node` from `>=24` to `>=22` to unblock consumers that run Node 22 (e.g. `alexandria-web-application`). The primary-face loading stays on the consumer side — see RULES.md §8 for Next.js, Vite and email/PDF setups.
