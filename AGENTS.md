# pharos-tokens

Design tokens for Code Sherpas, published as `@code-sherpas/pharos-tokens`.
**Technology-agnostic package**: no React, no Tailwind, no framework
dependencies. Consumable from any frontend (React, Vue, Svelte,
React Native) and from backends (transactional emails, PDFs, reports).

## Stack

- Single-package repo (pnpm)
- TypeScript (only to type the outputs)
- Style Dictionary v4 (DTCG → CSS + JS compiler)
- DTCG format (Design Tokens Community Group)
- OKLCH colors
- Vitest (WCAG contrast, DTCG format, CSS output)
- Changesets

## Philosophy

pharos-tokens is the **single source of truth** for Code Sherpas's atomic
visual decisions. Anything with a value (color, spacing, radius, typography,
shadow, animation, z-index) lives here. Components (in `pharos-react`) and
apps (`alexandria-*`) consume it, not the other way around.

Principles:

1. **State-of-the-art first; Alexandria adapts to Pharos, not the
   reverse.** (Cardinal rule, restated by the CTO on 2026-04-26.)
   pharos-tokens is the explicit extraction of Alexandria's implicit
   token system, but it is not Alexandria's mirror — it is the
   state-of-the-art version Alexandria will adopt. Token _numerical
   values_ stay as close to Alexandria as possible (so the visual
   delta at adoption is small) but **the schema, naming, scales,
   references and DTCG conformance follow modern DS conventions**
   even when Alexandria's implicit approach diverges. When a
   best-practice choice (DTCG types, OKLCH, semantic role naming,
   8px grid, contrast guarantees) conflicts with an Alexandria
   quirk, the DS choice wins. Alexandria refactors at adoption time;
   structural cases roll into Phase 6.
2. **Framework-agnostic.** Zero dependencies on React, Vue, etc.
3. **Consumable in plain HTML.** A transactional email or a server-generated
   PDF must be able to use the CSS vars as-is.
4. **Independent versioning.** pharos-tokens has its own semver;
   pharos-react declares which token versions it supports.
5. **Validated accessibility.** Every color/on-color pair passes
   WCAG 2.1 AA in CI.

## NON-NEGOTIABLE rules

1. **DTCG format.** Every declared token follows the DTCG spec with `$value`,
   `$type`, `$description`.
2. **OKLCH colors.** No hex, no RGB. OKLCH is perceptually uniform and makes
   it easy to generate consistent scales.
3. **`pharos-` prefix in naming.** Every output CSS var is prefixed
   `--pharos-` to avoid collisions.
4. **Contrast tests in CI.** A PR cannot merge if any color/on-color pair
   fails WCAG 2.1 AA.
5. **Valid references.** If a token references another one
   (`{color.base.white}`), the referenced token must exist. CI validates it.
6. **Changeset required.** Breaking change = major (rename/remove). New token
   = minor. Value tweak without renaming = patch.
7. **No components or UI styles.** This package defines values, not visual
   structures. If someone proposes adding a component, it goes into
   `pharos-react`.
8. **No runtime dependencies.** Only `devDependencies`. The published output
   is data + types, never third-party executable code.

## Build outputs

`pnpm build` generates the following in `dist/`:

- `styles.css` — CSS custom properties prefixed `--pharos-*` (canonical, multi-framework).
- `tokens.js` — flat ESM constants (`PharosColorNeutral900`, etc.) for selective imports.
- `tokens.d.ts` — TypeScript types for the flat constants.
- `tokens.json` — nested values-only object (for tools that process tokens generically).
- `index.js` — friendly barrel with the nested object (`tokens.color.neutral['900']`).
- `index.d.ts` — types for the barrel (autocomplete by path).

The raw DTCG source files (`src/*.tokens.json`) are exposed via the `./dtcg/*`
subpath for advanced consumers that transform them with their own tools
(e.g. iOS/Android token pipelines).

## Workflow to update a token

See skill `update-token` in `.agents/skills/update-token/SKILL.md`.

## Workflow to introduce a new category

See skill `add-token-category` in `.agents/skills/add-token-category/SKILL.md`.

## Source of the values

The current tokens are derived from the Alexandria analysis documented in
`alexandria-web-application:feat/fase-0-analysis/ANALYSIS-tokens.md` and from
the architectural decisions approved in the plan
(`PLAN-pharos-alexandria.md`, Fase 0 checkpoint, 2026-04-19).

**Adjustments vs Alexandria** for WCAG compliance:

- `color.semantic.success.fg` and `color.semantic.info.fg` are darker
  versions of the Alexandria values (`#05b661`, `#009bf9`) so that they
  pass AA 4.5:1 against a white background. The original Alexandria values
  failed.

## Expected MCP servers

This repo has `.mcp.json` with: `context7`, `github`. **It does not include
the shadcn MCP** — this repo does not deal with components.

**When to use each one:**

- **`context7`** → live documentation for Style Dictionary v4, the DTCG spec
  (Design Tokens Community Group), the OKLCH color space, TypeScript,
  culori. Use it before modifying the Style Dictionary config or when you
  need to confirm that a transform/format follows the current API.
- **`github`** → issues, PRs, releases. Use it to reference consumer issues
  (e.g. "pharos-react needs token `radius.full`") or when opening PRs.

## Useful commands

- `pnpm build` — compile DTCG to CSS + JS + types
- `pnpm test` — Vitest suite (WCAG contrast, DTCG format, CSS output)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm changeset` — create a changeset
- `pnpm release` — (CI only) build + publish to npm
- `node scripts/compute-oklch.mjs` — helper to convert Alexandria hex values to OKLCH

## Project knowledge & where things go

This repo is part of the **Pharos design-system program** (`pharos-tokens` →
`pharos-react` → `alexandria-design` → `alexandria-web-application`).
Program-level knowledge lives in **Notion → "Programa Pharos"**; code-coupled
knowledge lives in the repos.

**Rule #0 — cardinal, non-negotiable (overrides every other rule here and in
Notion).** Pharos follows the **state-of-the-art of the best design systems** —
clarity, accessibility, canonical naming, API contracts, scales, DTCG
conformance — **above any Alexandria-specific consideration** (visual fidelity,
quirks, convenience). Pharos is the state-of-the-art version Alexandria adopts,
not its mirror. When a DS best practice conflicts with something in Alexandria,
the DS wins; Alexandria adapts at adoption time. Token numerical values stay as
close to Alexandria as possible, but schema/naming/scales/references follow
modern DS conventions. (This restates Principle #1 above and is the program's
top rule.)

**Notion — "Programa Pharos" (team space):**

- Hub: https://app.notion.com/p/38c1751eee1081a3834ff68c3485c03c
- Roadmap: https://app.notion.com/p/38c1751eee10819189e2d0055549bc38
- Status: https://app.notion.com/p/38c1751eee1081589118edcdd40d5eee
- Decisions (D1–D17): https://app.notion.com/p/fea64661135b4c9aa186b4293f639dee
- Runbooks (CI/release/Chromatic, verification): https://app.notion.com/p/38c1751eee108126b580fc8b76f8205f
- Working agreements: https://app.notion.com/p/38c1751eee1081e29d03f4a97d2a9e96
- Tasks / follow-ups: https://app.notion.com/p/3ad5ddddeb384e449d8ca966e4700165
- Onboarding: https://app.notion.com/p/38c1751eee10814d989ddeaf01c45838

**Where each thing goes** — single source of truth: each fact has ONE home;
link from elsewhere, never copy.

| Content                                                         | Home                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| Code, tests, changesets                                         | this repo                                               |
| Library/API contract, token naming, scales                      | the owning Pharos repo (`RULES.md`)                     |
| Per-repo tech debt & adoption log                               | the repo (`docs/`)                                      |
| Agent skills (how we build)                                     | `code-sherpas/agent-skills` (skills-lock)               |
| Roadmap, plan, phase status                                     | Notion → Roadmap / Status                               |
| Architecture/program decisions (ADRs)                           | Notion → Decisions (link to the repo doc if repo-local) |
| Runbooks, CI/release/Chromatic quirks, verification recipes     | Notion → Runbooks                                       |
| Team norms / working agreements                                 | Notion → Working agreements                             |
| Task tracking / follow-ups                                      | Notion → Tasks                                          |
| Personal / machine-local (`settings.local.json`, language pref) | stays local; never shared                               |

`CLAUDE.md` is a symlink to this file (`.claude/CLAUDE.md → ../AGENTS.md`).
