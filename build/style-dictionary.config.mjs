#!/usr/bin/env node
/**
 * Style Dictionary v4 build pipeline.
 *
 * Inputs:  src/*.tokens.json  (DTCG format, OKLCH colors)
 * Outputs:
 *   - dist/styles.css     CSS custom properties prefixed with --pharos-*
 *   - dist/index.js       ESM module exporting a typed tokens object
 *   - dist/index.d.ts     TypeScript declarations
 *
 * The DTCG source files are also shipped as-is under the package subpath "./dtcg/*".
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['src/**/*.tokens.json'],
  // Text styles (`type.*`) are DTCG typography composites. Each property is
  // published as its own custom property (--pharos-type-h1-font-size, …):
  // the CSS `font` shorthand would drop letter-spacing.
  expand: { include: ['typography'] },
  log: { verbosity: 'default' },
  platforms: {
    css: {
      // The `css` group minus `time/seconds`: since Style Dictionary 5.7.0 that
      // transform also matches DTCG `duration` tokens and turns `100ms` into
      // `0.1s`. The CSS keeps the milliseconds the source declares, as the JS
      // output does (a consumer reading the value as text gets the same number).
      transforms: StyleDictionary.hooks.transformGroups.css.filter(
        function isNotTimeSeconds(transform) {
          return transform !== 'time/seconds';
        },
      ),
      prefix: 'pharos',
      buildPath: 'dist/',
      files: [
        {
          destination: 'styles.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root',
          },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      prefix: 'pharos',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.json',
          format: 'json/nested',
        },
      ],
    },
    types: {
      transformGroup: 'js',
      prefix: 'pharos',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
  },
});

await sd.hasInitialized;
await sd.buildAllPlatforms();

// Generate a friendly ESM barrel + matching types from the flat JSON so that
// consumers can `import { tokens } from '@code-sherpas/pharos-tokens'` and get
// a deeply-nested, fully-typed object without Style Dictionary metadata noise.
const jsonPath = resolve('dist/tokens.json');
const raw = await readFile(jsonPath, 'utf8');
const json = JSON.parse(raw);

function serialize(value, indent = 2, depth = 0) {
  const pad = ' '.repeat(indent * depth);
  const innerPad = ' '.repeat(indent * (depth + 1));
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[\n${value.map((v) => innerPad + serialize(v, indent, depth + 1)).join(',\n')}\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (!entries.length) return '{}';
  const body = entries
    .map(([k, v]) => `${innerPad}${JSON.stringify(k)}: ${serialize(v, indent, depth + 1)}`)
    .join(',\n');
  return `{\n${body}\n${pad}}`;
}

const indexJs = `/**
 * Do not edit directly, this file was auto-generated.
 *
 * Usage:
 *   import { tokens } from '@code-sherpas/pharos-tokens';
 *   tokens.color.neutral['900']; // OKLCH string
 */
export const tokens = ${serialize(json)};
export default tokens;
`;

await writeFile(resolve('dist/index.js'), indexJs, 'utf8');

// Spell the object's type out, key by key, so that every token path is typed
// and a renamed or removed token breaks the consumer's compilation.
//
// The declarations must stand on their own. They used to `import tokens from
// './tokens.json'` and declare `const tokens: typeof tokens`: the import and
// the constant shared a name, so TypeScript reported TS2440/TS2456/TS2502 in
// every consumer with `skipLibCheck: false` and typed `tokens` as `any` in the
// rest. A JSON import would also need `resolveJsonModule` from the consumer,
// and an import attribute under `module: nodenext`. `pnpm verify:dist-types`
// compiles a consumer against the packed tarball so this cannot come back.
//
// Values are typed `string`, not their literal: a value tweak is a patch
// (.changeset/README.md) and must not break anyone's compilation.
function declareType(value, indent = 2, depth = 0) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`tokens.json holds a ${JSON.stringify(value)} the barrel cannot type`);
  }
  const pad = ' '.repeat(indent * depth);
  const innerPad = ' '.repeat(indent * (depth + 1));
  const members = Object.entries(value).map(function declareMember([key, member]) {
    const type = typeof member === 'string' ? 'string' : declareType(member, indent, depth + 1);
    return `${innerPad}${JSON.stringify(key)}: ${type};`;
  });
  return `{\n${members.join('\n')}\n${pad}}`;
}

const indexDts = `/**
 * Do not edit directly, this file was auto-generated.
 */
export type PharosTokens = ${declareType(json)};
export declare const tokens: PharosTokens;
export default tokens;
`;

await writeFile(resolve('dist/index.d.ts'), indexDts, 'utf8');

console.log('✓ Pharos tokens built to dist/');
console.log('  - dist/styles.css    (CSS custom properties, --pharos-*)');
console.log('  - dist/tokens.js     (flat ESM constants: PharosColorNeutral900, ...)');
console.log('  - dist/tokens.d.ts   (types for flat constants)');
console.log('  - dist/tokens.json   (nested values-only JSON)');
console.log('  - dist/index.js      (friendly ESM barrel: export { tokens })');
console.log('  - dist/index.d.ts    (typed barrel: typeof tokens)');
