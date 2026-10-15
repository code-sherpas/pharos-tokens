# Artifact snapshot

The Pharos design system artifact is the source of truth for every token
(decision D23): https://claude.ai/artifact/AzsXQ2SHXhPJ9BhRSoGTbV

This folder holds a verbatim copy of the two artifact files that define tokens,
because the artifact cannot be read from CI (it needs a claude.ai session):

| File          | Artifact path                      | What it holds                                     |
| ------------- | ---------------------------------- | ------------------------------------------------- |
| `tokens.json` | `project/tokens.json`              | color, spacing, radius, shadow, z-index, text styles (`type.groups`) + usage |
| `bundle.css`  | `project/components/bundle.css`    | font primitives, duration, easing (`:root` vars)  |

Snapshot taken from artifact version `1792078341-45f5` on 2026-10-15.

## Refreshing it

1. Read both files from the artifact (with Claude Code: the Artifact tool,
   `read` with `path`) and copy them here byte for byte. Update the version
   line above.
2. `node scripts/sync-from-artifact.ts` lists what drifted.
3. `node scripts/sync-from-artifact.ts --write` copies changed values and
   usage notes into `src/`, then `pnpm format`. A token the artifact added
   or dropped is listed for you to place (a DTCG path and `$type`) or to mark
   `$deprecated`.
   A text style that changed is listed property by property
   (`--pharos-type-h1-font-size`, …) and edited by hand in
   `src/typography.tokens.json` (`type.*`): `--write` does not rewrite composites.
4. `pnpm build && pnpm test` — the test `artifact-sync` fails while `src/`
   and this snapshot disagree. Add a changeset.
