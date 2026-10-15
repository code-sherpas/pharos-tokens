/**
 * Keeps src/*.tokens.json in step with the Pharos design system artifact, which
 * is the source of truth for every token (decision D23).
 *
 * The artifact cannot be read from here (it needs a claude.ai session), so it
 * is read through a snapshot of the two files that hold its tokens, committed
 * under artifact/ and refreshed by hand (see artifact/README.md):
 *
 *   artifact/tokens.json  — the artifact's project/tokens.json (color, spacing,
 *                           radius, shadow, z-index), with a usage note per token
 *   artifact/bundle.css   — the artifact's project/components/bundle.css, whose
 *                           :root declares what tokens.json has no place for
 *                           (font primitives, duration, easing)
 *
 * Tokens are matched by the CSS custom property each side produces
 * (--pharos-*). Values are compared resolved; descriptions are compared where
 * the artifact has a usage note.
 *
 *   node scripts/sync-from-artifact.ts           report drift, exit 1 if any
 *   node scripts/sync-from-artifact.ts --write   copy changed values and
 *                                                descriptions into src/, then
 *                                                run `pnpm format`
 *
 * --write only changes existing tokens. A token the artifact has and src/ does
 * not, or the reverse, is reported for a person to place (it needs a DTCG path
 * and a $type) or to deprecate. Tokens marked $deprecated in src/ are kept on
 * purpose until the next major and are not compared.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export type Token = { value: string; description?: string };

export type TokenMap = Map<string, Token>;

export type Change = {
  name: string;
  field: 'value' | 'description';
  src: string;
  artifact: string;
};

export type Drift = {
  changed: Change[];
  onlyInArtifact: string[];
  onlyInSrc: string[];
};

type DtcgLeaf = { $value: unknown; $type?: string; $description?: string; $deprecated?: unknown };

type SrcToken = { file: string; path: string[]; leaf: DtcgLeaf };

const ALIAS = /^\{([^}]+)\}$/;

/** The custom property name Style Dictionary's css transform group gives a DTCG path. */
export function cssNameOf(path: string[]): string {
  const segments = path.map(function kebab(segment) {
    return segment
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/\./g, '-')
      .toLowerCase();
  });
  return ['pharos', ...segments].join('-');
}

function isLeaf(node: unknown): node is DtcgLeaf {
  return typeof node === 'object' && node !== null && '$value' in node;
}

function collectSrcTokens(file: string, node: unknown, path: string[], out: SrcToken[]): void {
  if (isLeaf(node)) {
    out.push({ file, path, leaf: node });
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  for (const [key, child] of Object.entries(node)) {
    if (!key.startsWith('$')) collectSrcTokens(file, child, [...path, key], out);
  }
}

export function readSrcTokens(srcDir: string): {
  tokens: SrcToken[];
  documents: Map<string, unknown>;
} {
  const tokens: SrcToken[] = [];
  const documents = new Map<string, unknown>();
  for (const name of readdirSync(srcDir)
    .filter((f) => f.endsWith('.tokens.json'))
    .sort()) {
    const file = join(srcDir, name);
    const document: unknown = JSON.parse(readFileSync(file, 'utf8'));
    documents.set(file, document);
    collectSrcTokens(file, document, [], tokens);
  }
  return { tokens, documents };
}

/** The properties a text style carries; each is published as its own custom property. */
export const TEXT_STYLE_PROPERTIES = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
] as const;

/**
 * The custom properties a token is published as: its own name, or, for a text
 * style (a DTCG typography composite, expanded by the build), one per property.
 */
export function publishedNamesOf(path: string[], leaf: DtcgLeaf): string[] {
  if (leaf.$type !== 'typography') return [cssNameOf(path)];
  return TEXT_STYLE_PROPERTIES.map((property) => cssNameOf([...path, property]));
}

function srcValue(value: unknown): string {
  const text = String(value);
  const alias = ALIAS.exec(text.trim());
  return alias ? `{${cssNameOf(alias[1].split('.'))}}` : text;
}

/**
 * src/ tokens by css name, aliases rewritten to the css name they point at.
 * A text style contributes one entry per property, plus one under its own name
 * that carries only its description (it has no custom property of its own).
 */
export function srcTokenMap(tokens: SrcToken[]): TokenMap {
  const map: TokenMap = new Map();
  for (const { path, leaf } of tokens) {
    if (leaf.$deprecated !== undefined) continue;
    if (leaf.$type === 'typography' && typeof leaf.$value === 'object' && leaf.$value !== null) {
      const style = leaf.$value as Record<string, unknown>;
      map.set(cssNameOf(path), { value: '', description: leaf.$description });
      for (const property of TEXT_STYLE_PROPERTIES) {
        if (style[property] !== undefined) {
          map.set(cssNameOf([...path, property]), { value: srcValue(style[property]) });
        }
      }
      continue;
    }
    map.set(cssNameOf(path), { value: srcValue(leaf.$value), description: leaf.$description });
  }
  return map;
}

type ArtifactEntry = { name: string; value: unknown; usage?: string };

function firstThemeValue(value: unknown, firstTheme: string): string {
  if (typeof value === 'object' && value !== null) {
    const byTheme = value as Record<string, unknown>;
    return String(byTheme[firstTheme] ?? Object.values(byTheme)[0]);
  }
  return String(value);
}

type ArtifactTextStyle = {
  name: string;
  family?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string;
  usage?: string;
};

type ArtifactType = {
  families?: Record<string, string>;
  groups?: Array<{ family?: string; styles?: ArtifactTextStyle[] }>;
};

/** The artifact's text styles (`type.groups[].styles`), in the shape srcTokenMap gives them. */
function textStylesOf(type: unknown): TokenMap {
  const { families = {}, groups = [] } = (type ?? {}) as ArtifactType;
  const map: TokenMap = new Map();
  for (const group of groups) {
    for (const style of group.styles ?? []) {
      const name = `pharos-${style.name}`;
      const family = families[style.family ?? group.family ?? ''];
      map.set(name, { value: '', description: style.usage?.trim() || undefined });
      const values: Record<(typeof TEXT_STYLE_PROPERTIES)[number], unknown> = {
        fontFamily: family,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      };
      for (const property of TEXT_STYLE_PROPERTIES) {
        if (values[property] !== undefined) {
          map.set(cssNameOf([style.name, property]), { value: String(values[property]) });
        }
      }
    }
  }
  return map;
}

/** The artifact's tokens.json families plus the :root custom properties of its bundle.css. */
export function artifactTokenMap(tokensJson: string, bundleCss: string): TokenMap {
  const document = JSON.parse(tokensJson) as Record<string, unknown> & {
    color?: { themes?: Array<{ id: string }> };
  };
  const firstTheme = document.color?.themes?.[0]?.id ?? 'light';
  const map: TokenMap = new Map();

  for (const [name, style] of textStylesOf(document.type)) map.set(name, style);
  for (const [family, content] of Object.entries(document)) {
    if (family === 'type') continue;
    const entries = (content as { tokens?: ArtifactEntry[] } | null)?.tokens;
    if (!Array.isArray(entries)) continue;
    for (const { name, value, usage } of entries) {
      map.set(name.replace(/^--/, ''), {
        value: firstThemeValue(value, firstTheme),
        description: usage?.trim() || undefined,
      });
    }
  }

  // bundle.css carries values only: its comments are not usage notes.
  const rootBlocks = bundleCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/:root\s*\{([^}]*)\}/g);
  for (const [, body] of rootBlocks) {
    for (const [, name, value] of body.matchAll(/--(pharos-[\w-]+)\s*:\s*([^;]+);/g)) {
      map.set(name, { value: value.trim() });
    }
  }
  return map;
}

function resolve(map: TokenMap, name: string, seen = new Set<string>()): string | undefined {
  const value = map.get(name)?.value;
  if (value === undefined || seen.has(name)) return undefined;
  const alias = ALIAS.exec(value.trim());
  return alias ? resolve(map, alias[1], new Set(seen).add(name)) : value;
}

/** Spelling-insensitive form: `82.70%` = `82.7%`, `0.0160` = `0.016`, spacing collapsed. */
export function normalizeValue(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/-?\d*\.?\d+/g, function canonicalNumber(n) {
      return String(Number(n));
    });
}

export function compare(src: TokenMap, artifact: TokenMap): Drift {
  const drift: Drift = { changed: [], onlyInArtifact: [], onlyInSrc: [] };
  for (const [name, fromArtifact] of [...artifact].sort(([a], [b]) => a.localeCompare(b))) {
    const fromSrc = src.get(name);
    if (!fromSrc) {
      drift.onlyInArtifact.push(name);
      continue;
    }
    const srcValue = resolve(src, name) ?? '';
    const artifactValue = resolve(artifact, name) ?? '';
    if (normalizeValue(srcValue) !== normalizeValue(artifactValue)) {
      drift.changed.push({ name, field: 'value', src: srcValue, artifact: artifactValue });
    }
    if (
      fromArtifact.description !== undefined &&
      fromArtifact.description !== fromSrc.description
    ) {
      drift.changed.push({
        name,
        field: 'description',
        src: fromSrc.description ?? '',
        artifact: fromArtifact.description,
      });
    }
  }
  drift.onlyInSrc = [...src.keys()].filter((name) => !artifact.has(name)).sort();
  return drift;
}

export function hasDrift(drift: Drift): boolean {
  return drift.changed.length + drift.onlyInArtifact.length + drift.onlyInSrc.length > 0;
}

/** Writes the artifact's value or description into src/ for every change, keeping aliases as aliases. */
function writeChanges(
  tokens: SrcToken[],
  documents: Map<string, unknown>,
  artifact: TokenMap,
  changes: Change[],
): void {
  const pathByCssName = new Map(tokens.map((t) => [cssNameOf(t.path), t.path.join('.')]));
  const changedFiles = new Set<string>();
  for (const { file, path, leaf } of tokens) {
    const name = cssNameOf(path);
    const fromArtifact = artifact.get(name);
    if (!fromArtifact || leaf.$deprecated !== undefined) continue;
    for (const { field } of changes.filter((c) => c.name === name)) {
      if (field === 'description') {
        leaf.$description = fromArtifact.description;
      } else {
        const alias = ALIAS.exec(fromArtifact.value.trim());
        const target = alias ? pathByCssName.get(alias[1]) : undefined;
        leaf.$value = target ? `{${target}}` : fromArtifact.value;
      }
      changedFiles.add(file);
    }
  }
  // Only the files that changed; `pnpm format` restores the repo's layout afterwards.
  for (const file of changedFiles) {
    writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
  }
}

function report(drift: Drift): string {
  const lines: string[] = [];
  for (const { name, field, src, artifact } of drift.changed) {
    lines.push(`${field.padEnd(11)} --${name}: ${src}  →  ${artifact}`);
  }
  for (const name of drift.onlyInArtifact) {
    lines.push(`missing     --${name}: in the artifact, not in src/ (add it with a DTCG path)`);
  }
  for (const name of drift.onlyInSrc) {
    lines.push(
      `extra       --${name}: in src/, not in the artifact (remove it or mark $deprecated)`,
    );
  }
  return lines.join('\n');
}

function main(): void {
  const root = process.cwd();
  const { tokens, documents } = readSrcTokens(join(root, 'src'));
  const artifact = artifactTokenMap(
    readFileSync(join(root, 'artifact/tokens.json'), 'utf8'),
    readFileSync(join(root, 'artifact/bundle.css'), 'utf8'),
  );
  const drift = compare(srcTokenMap(tokens), artifact);

  if (process.argv.includes('--write') && drift.changed.length > 0) {
    writeChanges(tokens, documents, artifact, drift.changed);
    console.log(`Wrote ${drift.changed.length} change(s) into src/. Run \`pnpm format\` next.`);
    drift.changed = [];
  }
  if (!hasDrift(drift)) {
    console.log('src/ matches the artifact snapshot.');
    return;
  }
  console.log(report(drift));
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
