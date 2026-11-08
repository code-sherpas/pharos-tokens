// What a TypeScript consumer of the published package writes. It is compiled
// by `pnpm verify:dist-types` against the packed tarball, with
// `skipLibCheck: false` and no `resolveJsonModule`, under `moduleResolution`
// `bundler`, `node16` and `nodenext`.
//
// Each `@ts-expect-error` below is load-bearing: if `tokens` were `any`, the
// directive would be unused and the compilation would fail with TS2578.
import defaultTokens, { tokens, type PharosTokens } from '@code-sherpas/pharos-tokens';

export const panelBreakpoint: string = tokens.breakpoint.panel;
export const panelWidth: string = tokens.width.panel;
export const neutral900: string = tokens.color.neutral['900'];
export const sameObject: PharosTokens = defaultTokens;

// @ts-expect-error a token that does not exist must not compile, so a rename breaks the consumer
export const missingBreakpoint = tokens.breakpoint.doesNotExist;

// @ts-expect-error a token value is a string, not anything
export const notANumber: number = tokens.width.panel;
