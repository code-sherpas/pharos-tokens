#!/bin/bash
#
# Compiles a consumer against the package as npm would install it.
#
#   bash scripts/verify-dist-types.sh      (pnpm build runs it; needs dist/)
#
# It packs the tarball, unpacks it into a throwaway project's node_modules and
# compiles `tests/dist-types/consumer.ts` there with `skipLibCheck: false` and
# no `resolveJsonModule`, with `moduleResolution` `bundler`, `node16` and
# `nodenext`. That is what a consumer's TypeScript sees and the repository's
# own `pnpm typecheck` does not: it runs with `skipLibCheck: true`, which hid a
# `dist/index.d.ts` that failed to compile (TS2440/TS2456/TS2502) and typed
# `tokens` as `any` in pharos-tokens 1.0.1 and 1.1.0.
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tsc="$repository_root/node_modules/.bin/tsc"
consumer="$(mktemp -d)"
trap 'rm -rf "$consumer"' EXIT

cd "$repository_root"
pnpm pack --pack-destination "$consumer" >/dev/null
package_dir="$consumer/node_modules/@code-sherpas/pharos-tokens"
mkdir -p "$package_dir"
tar -xzf "$consumer"/code-sherpas-pharos-tokens-*.tgz -C "$package_dir" --strip-components=1

cp tests/dist-types/consumer.ts "$consumer/consumer.ts"
echo '{ "name": "pharos-tokens-consumer", "private": true, "type": "module" }' > "$consumer/package.json"

for resolution in bundler node16 nodenext; do
    if [ "$resolution" = bundler ]; then module=esnext; else module="$resolution"; fi
    cat > "$consumer/tsconfig.json" <<EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "$module",
    "moduleResolution": "$resolution",
    "strict": true,
    "skipLibCheck": false,
    "noEmit": true,
    "types": []
  },
  "files": ["consumer.ts"]
}
EOF
    if ! "$tsc" -p "$consumer/tsconfig.json"; then
        echo "❌ A consumer with moduleResolution $resolution cannot compile against the packed package." >&2
        exit 1
    fi
    echo "✓ dist types compile for a consumer with moduleResolution $resolution"
done
