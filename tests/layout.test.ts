import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

type LayoutTokens = {
  width: { panel: string };
  breakpoint: Record<string, string>;
};

let css = '';
let tokens: LayoutTokens;

beforeAll(async function loadBuiltPackage() {
  css = await readFile('dist/styles.css', 'utf8');
  // The barrel consumers import: `import { tokens } from '@code-sherpas/pharos-tokens'`.
  const barrel = (await import(pathToFileURL(resolve('dist/index.js')).href)) as {
    tokens: LayoutTokens;
  };
  tokens = barrel.tokens;
});

describe('panel width (D32)', () => {
  it('is published as --pharos-width-panel, the width Sheet fixes today', () => {
    expect(css).toMatch(/--pharos-width-panel: 24rem;/);
  });

  it('is readable from the tokens object', () => {
    expect(tokens.width.panel).toBe('24rem');
  });
});

describe('panel breakpoint (D32)', () => {
  it('is published as --pharos-breakpoint-panel', () => {
    expect(css).toMatch(/--pharos-breakpoint-panel: 64rem;/);
  });

  it('is readable from the tokens object, which is what matchMedia gets', () => {
    expect(tokens.breakpoint.panel).toBe('64rem');
  });
});

describe('breakpoints', () => {
  it('are all rem lengths, so a media query built from one is valid and follows the text size', () => {
    const entries = Object.entries(tokens.breakpoint);
    expect(entries.length).toBeGreaterThan(0);
    for (const [role, value] of entries) {
      expect(value, `breakpoint.${role}`).toMatch(/^\d+(\.\d+)?rem$/);
    }
  });
});
