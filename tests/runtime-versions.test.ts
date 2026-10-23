import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Why this test exists.
//
// The Node and pnpm versions are pinned in several places that do different
// jobs, and a pin that drifts from the others fails somewhere nobody is looking:
//
//   - `packageManager` is what corepack, CI (pnpm/action-setup) and Dependabot
//     run. `engines.pnpm` is what stops any OTHER pnpm, because every pnpm checks
//     `engines` under `engine-strict`. Each is useless if it names a different
//     version from the other. A consumer's pnpm does not check a dependency's
//     `engines.pnpm` (measured with pnpm 10.33.0 and 11.27.0), so publishing it
//     constrains nobody downstream.
//   - `.node-version` is the exact Node this repository is developed, built and
//     released with: CI reads it through `node-version-file`,
//     `check-node-version.sh` holds local work to it. `.nvmrc` is what `nvm use`
//     reads, so it must say the same.
//   - `engines.node` is published, so it is the range consumers may run, not the
//     pin. It must stay a range that admits `.node-version`, and never an exact
//     version: Dependabot's updater runs whatever Node GitHub ships in its image,
//     and an `engines.node` that excludes it stops every update, silently —
//     measured in alexandria-web-application on 2026-09-22 (7a42541f5).

const REPOSITORY_ROOT = fileURLToPath(new URL('..', import.meta.url));

interface PackageJson {
  packageManager: string;
  engines: { node: string; pnpm: string };
}

const packageJson = JSON.parse(
  readFileSync(join(REPOSITORY_ROOT, 'package.json'), 'utf8'),
) as PackageJson;

function readTrimmed(fileName: string): string {
  return readFileSync(join(REPOSITORY_ROOT, fileName), 'utf8').trim();
}

describe('the pinned runtime versions', () => {
  it('pins engines.pnpm to exactly the pnpm in packageManager', () => {
    const [name, version] = packageJson.packageManager.split('@');

    expect(name).toBe('pnpm');
    expect(packageJson.engines.pnpm).toBe(version);
  });

  it('names the same Node in .nvmrc and .node-version', () => {
    expect(readTrimmed('.nvmrc')).toBe(readTrimmed('.node-version'));
  });

  it('keeps engines.node a lower-bound range that admits .node-version, never an exact pin', () => {
    const nodeMajor = Number(readTrimmed('.node-version').split('.')[0]);
    const range = /^>=(\d+)$/.exec(packageJson.engines.node);

    expect(range).not.toBeNull();
    expect(Number(range?.[1])).toBeLessThanOrEqual(nodeMajor);
  });
});

describe('check-node-version.sh', () => {
  let sandbox: string;

  beforeEach(() => {
    sandbox = mkdtempSync(join(tmpdir(), 'check-node-version-'));
    mkdirSync(join(sandbox, 'scripts'));
    mkdirSync(join(sandbox, 'bin'));
    copyFileSync(
      join(REPOSITORY_ROOT, 'scripts', 'check-node-version.sh'),
      join(sandbox, 'scripts', 'check-node-version.sh'),
    );
    writeFileSync(join(sandbox, '.node-version'), '24.22.1\n');
  });

  afterEach(() => {
    rmSync(sandbox, { recursive: true, force: true });
  });

  function runWithNode(version: string): { status: number | null; output: string } {
    const fakeNode = join(sandbox, 'bin', 'node');
    writeFileSync(fakeNode, `#!/bin/sh\necho v${version}\n`);
    chmodSync(fakeNode, 0o755);
    const result = spawnSync('bash', [join(sandbox, 'scripts', 'check-node-version.sh')], {
      env: { ...process.env, PATH: `${join(sandbox, 'bin')}:${process.env.PATH ?? ''}` },
      encoding: 'utf8',
    });
    return { status: result.status, output: result.stdout + result.stderr };
  }

  it('passes when the shell runs exactly the Node in .node-version', () => {
    expect(runWithNode('24.22.1').status).toBe(0);
  });

  it('refuses an older patch of the same major, and says how to switch', () => {
    const { status, output } = runWithNode('24.15.0');

    expect(status).toBe(1);
    expect(output).toContain('24.22.1');
    expect(output).toContain('nvm install && nvm use');
  });

  it('refuses a newer Node too, because the pin is exact', () => {
    expect(runWithNode('24.30.0').status).toBe(1);
  });
});
