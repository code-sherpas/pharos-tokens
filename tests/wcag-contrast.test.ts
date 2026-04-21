import { describe, it, expect } from 'vitest';
import { converter, formatHex, wcagContrast, parse } from 'culori';
import tokensRaw from '../dist/tokens.json' with { type: 'json' };

const tokens = tokensRaw as typeof tokensRaw & {
  color: {
    base: { white: string; black: string };
    neutral: Record<string, string>;
    primary: Record<string, string>;
    semantic: {
      success: { fg: string; bg: string; on: string };
      error: {
        fg: string;
        'fg-hover': string;
        'fg-active': string;
        bg: string;
        on: string;
      };
      warning: { fg: string; bg: string; on: string };
      info: { fg: string; bg: string; on: string };
    };
  };
};

const toRgb = converter('rgb');

function resolveToHex(value: string): string {
  const parsed = parse(value);
  if (!parsed) throw new Error(`Unparseable color: ${value}`);
  const rgb = toRgb(parsed);
  if (!rgb) throw new Error(`Unconvertible color (to rgb): ${value}`);
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
  // For each semantic family, `.fg` is the filled surface color (the red pill,
  // the green badge), and `.on` is the content — text or icon — placed on top.
  // `surface` / `onSurface` match the Material/Tailwind v4 convention for these
  // roles; the test case labels still reference the token paths.
  //
  // Threshold rationale:
  //   error/success/info — AA_NORMAL (4.5:1). These are consumed as filled
  //   buttons with 14px regular-weight text, so the stricter threshold
  //   applies. Values are darkened vs Alexandria where needed (see token
  //   descriptions).
  //   warning — AA_LARGE (3:1). Warning is an amber with a *dark* `on` color
  //   (neutral-900). Amber cannot pass AA normal against dark text without
  //   becoming visually indistinguishable from success/primary — industry
  //   practice (Material, Carbon, Primer) uses AA large for warning surfaces
  //   or accompanies them with an icon + heavier weight.
  const cases: Array<[string, string, string, number]> = [
    [
      'semantic.error.fg vs error.on',
      tokens.color.semantic.error.fg,
      tokens.color.semantic.error.on,
      AA_NORMAL,
    ],
    [
      'semantic.success.fg vs success.on',
      tokens.color.semantic.success.fg,
      tokens.color.semantic.success.on,
      AA_NORMAL,
    ],
    [
      'semantic.info.fg vs info.on',
      tokens.color.semantic.info.fg,
      tokens.color.semantic.info.on,
      AA_NORMAL,
    ],
    [
      'semantic.warning.fg vs warning.on',
      tokens.color.semantic.warning.fg,
      tokens.color.semantic.warning.on,
      AA_LARGE,
    ],
  ];

  it.each(cases)('%s passes threshold', (_name, surface, onSurface, threshold) => {
    const ratio = contrast(surface, onSurface);
    expect(ratio).toBeGreaterThanOrEqual(threshold);
  });
});

describe('WCAG 2.1 AA contrast for error hover/active states', () => {
  // Interactive states on filled destructive buttons must still be legible
  // against the same `on` color used for the base state. Hover/active shades
  // are darker than `fg`, so contrast should be equal-or-better — the tests
  // lock that in so future adjustments can't regress it.
  const errorOn = tokens.color.semantic.error.on;
  const cases: Array<[string, string, number]> = [
    ['error.fg-hover vs error.on', tokens.color.semantic.error['fg-hover'], AA_NORMAL],
    ['error.fg-active vs error.on', tokens.color.semantic.error['fg-active'], AA_NORMAL],
  ];

  it.each(cases)('%s passes AA normal text', (_name, surface, threshold) => {
    const ratio = contrast(surface, errorOn);
    expect(ratio).toBeGreaterThanOrEqual(threshold);
  });

  it('error.fg-hover is darker than error.fg', () => {
    const base = contrast(tokens.color.semantic.error.fg, errorOn);
    const hover = contrast(tokens.color.semantic.error['fg-hover'], errorOn);
    expect(hover).toBeGreaterThan(base);
  });

  it('error.fg-active is darker than error.fg-hover', () => {
    const hover = contrast(tokens.color.semantic.error['fg-hover'], errorOn);
    const active = contrast(tokens.color.semantic.error['fg-active'], errorOn);
    expect(active).toBeGreaterThan(hover);
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

  // Guard against drift: any neutral below 500 must stay below AA body text
  // threshold so designers don't pick them for body copy by accident. If a
  // future tweak makes one of these dark enough to pass AA, revisit the
  // boundary between "text" and "decorative" neutrals.
  it.each([
    ['neutral.400', tokens.color.neutral['400']],
    ['neutral.300', tokens.color.neutral['300']],
    ['neutral.200', tokens.color.neutral['200']],
    ['neutral.100', tokens.color.neutral['100']],
  ])('%s on white is too light for body text (UI-decorative only)', (_name, surface) => {
    const ratio = contrast(surface, tokens.color.base.white);
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
