import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';

let css = '';

beforeAll(async () => {
  css = await readFile('dist/styles.css', 'utf8');
});

describe('CSS output', () => {
  it('contains the --pharos-* prefix on every custom property', () => {
    const customPropertyLines = css
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('--'));
    expect(customPropertyLines.length).toBeGreaterThan(0);
    for (const line of customPropertyLines) {
      expect(line.startsWith('--pharos-'), `Non-prefixed custom property: ${line}`).toBe(true);
    }
  });

  it('declares the hero tokens Alexandria relies on', () => {
    const required = [
      '--pharos-color-neutral-900:',
      '--pharos-color-primary-600:',
      '--pharos-color-semantic-error-fg:',
      '--pharos-color-semantic-success-fg:',
      '--pharos-color-base-white:',
      '--pharos-spacing-4:',
      '--pharos-radius-2xl:',
      '--pharos-font-size-sm:',
      '--pharos-z-modal:',
    ];
    for (const name of required) {
      expect(css, `Missing CSS var: ${name}`).toContain(name);
    }
  });

  it('wraps declarations in :root', () => {
    expect(css).toContain(':root {');
  });

  it('does NOT contain any raw hex hardcoded outside of OKLCH values', () => {
    // Rule: Pharos outputs OKLCH. Shadows may contain `rgb(0 0 0 / ...)` by design.
    // Forbid any top-level `#...` hex in custom property values.
    const hexRegex = /--pharos-[a-z0-9-]+:\s*#[0-9a-fA-F]/g;
    const matches = css.match(hexRegex);
    expect(matches, `Unexpected hex in CSS: ${matches?.join(', ')}`).toBeNull();
  });
});
