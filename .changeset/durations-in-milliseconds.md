---
'@code-sherpas/pharos-tokens': patch
---

`styles.css` publishes durations in milliseconds again, as the source and `tokens.js` declare them: `--pharos-duration-fast: 100ms` (and `200ms`, `300ms`), not `0.1s`. Since 0.8.1 Style Dictionary 5.7.0's `time/seconds` transform had started converting DTCG `duration` tokens. Same time in CSS, so no visual change; a consumer reading the variable as text now gets the number the source declares.
