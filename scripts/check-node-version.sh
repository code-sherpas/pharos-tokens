#!/bin/bash
#
# Fails unless the running Node is exactly the one in `.node-version`.
#
#   bash scripts/check-node-version.sh
#
# `.node-version` is the single place the exact version this repository is
# developed, built and released with lives: CI and the release workflow read it
# through `node-version-file`, `nvm` reads the same value from `.nvmrc`, and this
# script holds local work to it — `pnpm build` and `pnpm test` run it.
# `tests/runtime-versions.test.ts` fails if the pins drift.
#
# `engines.node` in `package.json` is NOT that version and must not become it: it
# is the range of Node this published package supports for its consumers
# (`>=22`). It also has to admit whatever Node Dependabot's updater runs, which
# nobody can choose — an `engines.node` that excludes it stops every update, as
# happened in alexandria-web-application on 2026-09-22 (7a42541f5).
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
required_node_version="$(tr -d '[:space:]' < "$repository_root/.node-version")"
current_node_version="$(node -v | sed 's/^v//')"

if [ "$current_node_version" != "$required_node_version" ]; then
    echo "❌ This repository runs on Node $required_node_version (.node-version) and this shell has $current_node_version." >&2
    echo "   Switch with: nvm install && nvm use" >&2
    exit 1
fi
