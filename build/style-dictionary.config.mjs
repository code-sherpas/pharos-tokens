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
  log: { verbosity: 'default' },
  platforms: {
    css: {
      transformGroup: 'css',
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

// Derive a precise .d.ts by re-exporting the JSON's inferred type.
// TypeScript's resolveJsonModule + typeof gives us full autocomplete for
// every token path.
const indexDts = `/**
 * Do not edit directly, this file was auto-generated.
 */
import tokens from './tokens.json';

export type PharosTokens = typeof tokens;
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
