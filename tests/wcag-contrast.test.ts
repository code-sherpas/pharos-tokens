import { describe, it, expect } from 'vitest';
import { converter, formatHex, wcagContrast, parse } from 'culori';
import tokensRaw from '../dist/tokens.json' with { type: 'json' };

const tokens = tokensRaw as typeof tokensRaw & {
  color: {
    base: { white: string; black: string };
    neutral: Record<string, string>;
    primary: Record<string, string>;
    semantic: Record<
      'success' | 'error' | 'warning' | 'info',
      { fg: string; bg: string; on: string }
    >;
  };
};

const toRgb = converter('rgb');

function resolveToHex(value: string): string {
  const parsed = parse(value);
  if (!parsed) throw new Error(`Unparseable color: ${value}`);
  const rgb = toRgb(parsed);
  return formatHex(rgb);
}

function contrast(a: string, b: string): number {
  return wcagContrast(resolveToHex(a), resolveToHex(b));
}

// WCAG 2.1 Level AA minimum contrast ratio for normal text
// (text under 18pt, or under 14pt if bold): 4.5:1.
const AA_NORMAL = 4.5;
// WCAG 2.1 Level AA minimum contrast ratio for large text
// (18pt and larger, or 14pt bold and larger): 3.0:1.
const AA_LARGE = 3.0;

describe('WCAG 2.1 AA contrast for semantic color pairs', () => {
  const cases: Array<[string, string, string, number]> = [
    [
      'semantic.error.fg vs error.on',
      tokens.color.semantic.error.fg,
      tokens.color.semantic.error.on,
      AA_LARGE,
    ],
    [
      'semantic.success.fg vs success.on',
      tokens.color.semantic.success.fg,
      tokens.color.semantic.success.on,
      AA_LARGE,
    ],
    [
      'semantic.info.fg vs info.on',
      tokens.color.semantic.info.fg,
      tokens.color.semantic.info.on,
      AA_LARGE,
    ],
    [
      'semantic.warning.fg vs warning.on',
      tokens.color.semantic.warning.fg,
      tokens.color.semantic.warning.on,
      AA_LARGE,
    ],
  ];

  it.each(cases)('%s passes AA', (_name, fg, on, threshold) => {
    const ratio = contrast(fg, on);
    expect(ratio).toBeGreaterThanOrEqual(threshold);
  });
});

describe('Neutrals text readability on white surface', () => {
  it.each([
    ['neutral.900', tokens.color.neutral['900']],
    ['neutral.800', tokens.color.neutral['800']],
    ['neutral.700', tokens.color.neutral['700']],
    ['neutral.600', tokens.color.neutral['600']],
    ['neutral.500', tokens.color.neutral['500']],
  ])('%s on base.white passes AA normal text', (_name, fg) => {
    const ratio = contrast(fg, tokens.color.base.white);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('neutral.400 on white is too light for body text (flagged for UI-decorative only)', () => {
    const ratio = contrast(tokens.color.neutral['400'], tokens.color.base.white);
    expect(ratio).toBeLessThan(AA_NORMAL);
  });
});

describe('Primary readability on white surface', () => {
  it.each([
    ['primary.600', tokens.color.primary['600']],
    ['primary.700', tokens.color.primary['700']],
    ['primary.800', tokens.color.primary['800']],
    ['primary.900', tokens.color.primary['900']],
  ])('%s on base.white passes AA normal text', (_name, fg) => {
    const ratio = contrast(fg, tokens.color.base.white);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('white text on primary.600 passes AA large', () => {
    const ratio = contrast(tokens.color.base.white, tokens.color.primary['600']);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE);
  });
});
