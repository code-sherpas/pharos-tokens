---
'@code-sherpas/pharos-tokens': patch
---

Type the `tokens` object for real. `dist/index.d.ts` imported `./tokens.json` under the same name as the `tokens` constant it declared, so a consumer with `skipLibCheck: false` failed to compile (TS2440, TS2456, TS2502) and every other consumer got `tokens` as `any`: `tokens.breakpoint.panel` was unchecked, and renaming a token broke nobody's compilation.

The declarations now spell out every token path and import nothing, so they compile without `resolveJsonModule` or `skipLibCheck`, under `moduleResolution` `bundler`, `node16` and `nodenext`. Values are typed `string`. No token is added, renamed or removed and the runtime output is unchanged; a consumer that read a token path that does not exist now gets a compile error, which is the point.

`pnpm build` now packs the tarball and compiles a consumer against it (`pnpm verify:dist-types`), so it cannot come back.
