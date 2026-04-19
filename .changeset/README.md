# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

Every change to the public API of `@code-sherpas/pharos-tokens` — adding, modifying, or removing tokens — must include a changeset.

## Quick reference

- `pnpm changeset` — record a new change (pick patch / minor / major).
- `pnpm changeset version` — consume all pending changesets, bump `package.json`, and write the changelog.
- `pnpm release` — build and publish to npm (CI only).

## Semver policy for pharos-tokens

| Change                                         | Bump             |
|------------------------------------------------|------------------|
| Rename or remove a token                       | major (breaking) |
| Add a new token                                | minor            |
| Adjust a token value without renaming/removing | patch            |
| Internal build/tooling change                  | patch            |

For colors: adjusting a hue slightly is a patch. Replacing `color.primary.500` with a different visual meaning is major.
