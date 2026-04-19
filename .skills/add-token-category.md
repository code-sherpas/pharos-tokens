---
name: add-token-category
description: Use when a genuinely new token category is needed (e.g. animation timeline tokens, border-width tokens, an opacity scale) that does not fit the existing color/spacing/typography/radius/shadow files.
triggers:
  - 'new token category'
  - 'add token category'
  - 'add a type of token'
---

# Add a new token category to pharos-tokens

It is rarely necessary — most tokens fit into the five existing categories. Check with the CTO before starting this flow.

## 1. Confirm it does not fit an existing category

Before creating a new category, consider:

- **animation/transition** → `duration` and `easing` already live in `shadow.tokens.json`.
- **border-width** → could go into `radius.tokens.json` (or create `border.tokens.json`).
- **opacity** → live in `color.tokens.json` as aliases with `/` (e.g. `oklch(... / 0.5)`).
- **breakpoints** → not Pharos tokens — they belong in the consumer (Tailwind config).

If after review it really does need a new category, proceed below.

## 2. Create the DTCG file

`src/<category>.tokens.json`:

```json
{
  "<category>": {
    "tokenName": {
      "$value": "...",
      "$type": "...",
      "$description": "..."
    }
  }
}
```

Valid DTCG `$type`s: `color`, `dimension`, `duration`, `cubicBezier`, `fontFamily`, `fontWeight`, `number`, `shadow`, `strokeStyle`, `transition`, `typography`, `border`, `gradient`.

## 3. Register with Style Dictionary

Style Dictionary already uses `src/**/*.tokens.json` as the source, so the new file is picked up automatically. No need to touch `build/style-dictionary.config.mjs`.

## 4. Extend the tests

If the category has specific validations (e.g. "every animation duration must be between 50ms and 1000ms"), add a test in `tests/<category>.test.ts`.

## 5. Document

- Update the "Token structure" table in `README.md`.
- Update `RULES.md` if applicable.
- Update `AGENTS.md` if the workflow changes.

## 6. Semver

A new category is a minor bump (new tokens without breaking existing ones). Add the corresponding changeset.

## 7. Tell the consumers

Open issues in the repos that can take advantage of the new category (`pharos-react`, `alexandria-*`) explaining the tokens that are now available.
