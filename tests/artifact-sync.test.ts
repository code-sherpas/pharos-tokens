import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  artifactTokenMap,
  compare,
  publishedNamesOf,
  hasDrift,
  readSrcTokens,
  srcTokenMap,
  type TokenMap,
} from '../scripts/sync-from-artifact';

function tokenMap(entries: Record<string, string | { value: string; description?: string }>) {
  const map: TokenMap = new Map();
  for (const [name, token] of Object.entries(entries)) {
    map.set(name, typeof token === 'string' ? { value: token } : token);
  }
  return map;
}

describe('src/ against the artifact snapshot', () => {
  it('matches it: every token the artifact defines, with its value and usage note', () => {
    const { tokens } = readSrcTokens('src');
    const artifact = artifactTokenMap(
      readFileSync('artifact/tokens.json', 'utf8'),
      readFileSync('artifact/bundle.css', 'utf8'),
    );
    const drift = compare(srcTokenMap(tokens), artifact);
    expect(drift, 'Run `node scripts/sync-from-artifact.ts` to see what drifted').toEqual({
      changed: [],
      onlyInArtifact: [],
      onlyInSrc: [],
    });
  });

  it('names every src/ token the way the published CSS does', () => {
    const css = readFileSync('dist/styles.css', 'utf8');
    const { tokens } = readSrcTokens('src');
    for (const { path, leaf } of tokens) {
      for (const name of publishedNamesOf(path, leaf)) {
        expect(css, `${path.join('.')} is not published as --${name}`).toContain(`--${name}:`);
      }
    }
  });
});

describe('text styles', () => {
  const artifactWithH1 = (fontSize: string) =>
    JSON.stringify({
      color: { themes: [{ id: 'light' }], tokens: [] },
      type: {
        families: { sans: '"Outfit", sans-serif' },
        groups: [
          {
            family: 'sans',
            styles: [
              {
                name: 'type-h1',
                fontSize,
                fontWeight: 700,
                lineHeight: '1.25',
                letterSpacing: '-0.02em',
                usage: 'H1.',
              },
            ],
          },
        ],
      },
    });

  const src = srcTokenMap([
    {
      file: 't',
      path: ['font', 'family', 'sans'],
      leaf: { $value: '"Outfit", sans-serif', $type: 'fontFamily' },
    },
    { file: 't', path: ['font', 'size', '4xl'], leaf: { $value: '2.25rem', $type: 'dimension' } },
    {
      file: 't',
      path: ['type', 'h1'],
      leaf: {
        $type: 'typography',
        $description: 'H1.',
        $value: {
          fontFamily: '{font.family.sans}',
          fontSize: '{font.size.4xl}',
          fontWeight: '700',
          lineHeight: '1.25',
          letterSpacing: '-0.02em',
        },
      },
    },
  ]);

  it('match when every property resolves to the artifact value, references included', () => {
    // The artifact fixture holds only the style, so the primitives show up as src-only.
    const drift = compare(src, artifactTokenMap(artifactWithH1('2.25rem'), ''));
    expect(drift.changed).toEqual([]);
    expect(drift.onlyInArtifact).toEqual([]);
  });

  it('report a property the artifact changed', () => {
    const drift = compare(src, artifactTokenMap(artifactWithH1('2.5rem'), ''));
    expect(drift.changed).toEqual([
      { name: 'pharos-type-h1-font-size', field: 'value', src: '2.25rem', artifact: '2.5rem' },
    ]);
  });
});

describe('comparing src/ with the artifact', () => {
  it('reports a value the artifact changed', () => {
    const drift = compare(
      tokenMap({ 'pharos-color-neutral-800': 'oklch(37.05% 0.0436 247.87)' }),
      tokenMap({ 'pharos-color-neutral-800': 'oklch(24.5% 0.02 248.83)' }),
    );
    expect(drift.changed).toEqual([
      {
        name: 'pharos-color-neutral-800',
        field: 'value',
        src: 'oklch(37.05% 0.0436 247.87)',
        artifact: 'oklch(24.5% 0.02 248.83)',
      },
    ]);
  });

  it('ignores how a number is spelled', () => {
    const drift = compare(
      tokenMap({ 'pharos-color-primary-200': 'oklch(82.70% 0.0785 274.99)' }),
      tokenMap({ 'pharos-color-primary-200': 'oklch(82.7% 0.0785 274.99)' }),
    );
    expect(hasDrift(drift)).toBe(false);
  });

  it('treats an alias and the literal it resolves to as the same value', () => {
    const drift = compare(
      tokenMap({
        'pharos-color-base-white': 'oklch(100% 0 0)',
        'pharos-color-semantic-info-on': '{pharos-color-base-white}',
      }),
      tokenMap({
        'pharos-color-base-white': 'oklch(100% 0 0)',
        'pharos-color-semantic-info-on': 'oklch(100% 0 0)',
      }),
    );
    expect(hasDrift(drift)).toBe(false);
  });

  it('reports what only one side defines', () => {
    const drift = compare(
      tokenMap({ 'pharos-z-header': '1000' }),
      tokenMap({ 'pharos-z-index-sticky': '1100' }),
    );
    expect(drift.onlyInArtifact).toEqual(['pharos-z-index-sticky']);
    expect(drift.onlyInSrc).toEqual(['pharos-z-header']);
  });

  it('reports a usage note the artifact changed, and leaves descriptions alone where it has none', () => {
    const drift = compare(
      tokenMap({
        'pharos-radius-md': { value: '0.375rem', description: '6px. Default control rounding.' },
        'pharos-duration-fast': { value: '100ms', description: 'Micro interactions (hover).' },
      }),
      tokenMap({
        'pharos-radius-md': { value: '0.375rem', description: '6px — default control rounding.' },
        'pharos-duration-fast': { value: '100ms' },
      }),
    );
    expect(drift.changed).toEqual([
      {
        name: 'pharos-radius-md',
        field: 'description',
        src: '6px. Default control rounding.',
        artifact: '6px — default control rounding.',
      },
    ]);
  });
});

describe('reading the two sides', () => {
  it('does not compare src/ tokens marked $deprecated', () => {
    const map = srcTokenMap([
      {
        file: 'src/shadow.tokens.json',
        path: ['z', 'header'],
        leaf: { $value: '1000', $type: 'number', $deprecated: 'Use {zIndex.sticky}.' },
      },
      {
        file: 'src/shadow.tokens.json',
        path: ['zIndex', 'sticky'],
        leaf: { $value: '1100', $type: 'number' },
      },
    ]);
    expect([...map.keys()]).toEqual(['pharos-z-index-sticky']);
  });

  it('takes bundle.css :root custom properties and skips what its comments mention', () => {
    const map = artifactTokenMap(
      JSON.stringify({ color: { themes: [{ id: 'light' }], tokens: [] } }),
      `/* --pharos-font-size-xs: 99px; is only a comment */
       :root { --pharos-font-size-xs: 0.75rem; /* 12px */ --pharos-easing-in: cubic-bezier(0.4, 0, 1, 1); }`,
    );
    expect(Object.fromEntries(map)).toEqual({
      'pharos-font-size-xs': { value: '0.75rem' },
      'pharos-easing-in': { value: 'cubic-bezier(0.4, 0, 1, 1)' },
    });
  });

  it('reads the first theme of a themed value, and the usage note as the description', () => {
    const map = artifactTokenMap(
      JSON.stringify({
        color: { themes: [{ id: 'light' }, { id: 'dark' }], tokens: [] },
        shadow: {
          tokens: [
            {
              name: 'pharos-shadow-sm',
              value: { light: '0 1px 2px 0 rgb(0 0 0 / 0.05)', dark: 'none' },
              usage: 'Rest.',
            },
          ],
        },
      }),
      '',
    );
    expect(map.get('pharos-shadow-sm')).toEqual({
      value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      description: 'Rest.',
    });
  });
});
