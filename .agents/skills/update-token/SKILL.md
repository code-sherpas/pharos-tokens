---
name: update-token
description: Use when a maintainer wants to modify or add an existing token in pharos-tokens. Walks through editing the DTCG source, rebuilding, validating WCAG for colors, choosing the right version bump, and documenting the impact on consumers.
triggers:
  - 'update token'
  - 'modify token'
  - 'change a token value'
  - 'add a token'
---

# Update or add a token in pharos-tokens

## 1. Identify the right source file

Tokens live in `src/*.tokens.json` grouped by category:

- `src/color.tokens.json` — colors
- `src/spacing.tokens.json` — spacing
- `src/typography.tokens.json` — font family/weight/size/lineHeight/letterSpacing
- `src/radius.tokens.json` — border radius
- `src/shadow.tokens.json` — shadow, z, duration, easing

If the token does not fit any existing category, you probably need the `add-token-category` skill instead.

## 2. Edit the DTCG source

Every token follows the DTCG format:

```json
"keyName": {
  "$value": "oklch(... % ... ...)",
  "$type": "color",
  "$description": "Brief description of the use case + mention if it replaces anything from Alexandria."
}
```

Rules:

- Colors must always be in `oklch(...)`. If you only have a hex value, convert it with `node scripts/compute-oklch.mjs` or `culori`.
- Keep `$description` — the CSS output picks it up as a comment.
- If you reference another token: `"$value": "{color.base.white}"`.

## 3. Rebuild

```bash
pnpm build
```

Verify that it generates:

- `dist/styles.css`
- `dist/tokens.js` + `dist/tokens.d.ts` + `dist/tokens.json`
- `dist/index.js` + `dist/index.d.ts`

## 4. Run the tests

```bash
pnpm test
```

What gets validated:

- **WCAG 2.1 AA** for every new color and its `on-*` pair.
- **DTCG format**: `$value` + `$type` present.
- **Valid references**: if you used `{alias}`, it must point to an existing token.
- **CSS output**: every declared token appears as a `--pharos-*` custom property.

If any test fails, tweak the token (e.g. darker L in OKLCH if WCAG fails) until it passes.

## 5. Pick the version bump

| Change                              | Bump             |
| ----------------------------------- | ---------------- |
| Rename or remove a token            | major (breaking) |
| Add a new token                     | minor            |
| Adjust value without rename/removal | patch            |

```bash
pnpm changeset
```

Pick the type and describe the change. The changeset text ends up in the public CHANGELOG.

## 6. Document the impact on consumers

If the change is:

- **major**: add an explicit "BREAKING:" note to the changeset listing which token paths change. Consumers (`pharos-react`, `alexandria-*`) will need a migration.
- **minor**: mention in the changeset "New token `X` for use case Y".
- **patch**: the changeset can be short ("value tweak to improve contrast"). Even so, if it is a color, note the expected visual delta.

## 7. Open the PR

- Conventional commit: `feat(color): add color.accent.purple` or `fix(color): darken success.fg to pass AA 4.5`.
- CI must go green (lint, typecheck, build, test).
- If the change affects canonical naming or semantics, ping a maintainer for review.

## 8. After merge

Release happens automatically. CI publishes the new version to npm via Changesets. Confirm the new version appears on [npmjs.com/package/@code-sherpas/pharos-tokens](https://www.npmjs.com/package/@code-sherpas/pharos-tokens).

For downstream consumers (`pharos-react`), run their `upgrade-tokens-version` skill.
