import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';

async function loadTokenFiles(): Promise<Array<{ path: string; content: unknown }>> {
  const files: Array<{ path: string; content: unknown }> = [];
  for await (const entry of glob('src/*.tokens.json')) {
    const raw = await readFile(entry, 'utf8');
    files.push({ path: entry as string, content: JSON.parse(raw) });
  }
  return files;
}

type TokenLeaf = { $value: unknown; $type?: string; $description?: string };

function isLeaf(node: unknown): node is TokenLeaf {
  return typeof node === 'object' && node !== null && '$value' in node;
}

function walk(node: unknown, path: string[], visit: (path: string[], leaf: TokenLeaf) => void) {
  if (isLeaf(node)) {
    visit(path, node);
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  for (const [key, value] of Object.entries(node)) {
    walk(value, [...path, key], visit);
  }
}

function collectAllPaths(root: unknown): Set<string> {
  const paths = new Set<string>();
  walk(root, [], (path) => paths.add(path.join('.')));
  return paths;
}

describe('DTCG format validity', () => {
  it('every token has $value', async () => {
    const files = await loadTokenFiles();
    for (const { path, content } of files) {
      walk(content, [], (p, leaf) => {
        expect(leaf.$value, `${path}: token ${p.join('.')} missing $value`).toBeDefined();
      });
    }
  });

  it('every token has $type where DTCG requires it', async () => {
    const files = await loadTokenFiles();
    for (const { path, content } of files) {
      walk(content, [], (p, leaf) => {
        // We author $type on every token in Pharos for clarity, even though DTCG
        // permits inheritance. Enforcing it here keeps authors honest.
        expect(leaf.$type, `${path}: token ${p.join('.')} missing $type`).toBeDefined();
      });
    }
  });
});

describe('DTCG references resolve', () => {
  it('every {alias} reference points to a real token', async () => {
    const files = await loadTokenFiles();
    const allPaths = new Set<string>();
    for (const { content } of files) {
      for (const p of collectAllPaths(content)) allPaths.add(p);
    }

    const referenceRx = /^\{([^}]+)\}$/;

    for (const { path, content } of files) {
      walk(content, [], (p, leaf) => {
        const value = leaf.$value;
        if (typeof value !== 'string') return;
        const match = referenceRx.exec(value.trim());
        if (!match) return;
        const ref = match[1];
        expect(allPaths.has(ref), `${path}: token ${p.join('.')} references missing {${ref}}`).toBe(
          true,
        );
      });
    }
  });
});
