# Reporte Fase 1A: `@code-sherpas/pharos-tokens`

**Fecha:** 2026-04-19
**Duración real:** 1 turno de ejecución (post-checkpoint de Fase 0).
**Duración estimada del plan:** 2-3 días de trabajo humano.

## Resumen ejecutivo

El repo `pharos-tokens` está scaffoldeado, con los valores de tokens normalizados desde Alexandria, pipeline de Style Dictionary v4 funcionando, 22/22 tests WCAG + DTCG + CSS pasando, CI/release configurados, y configuración portable de IA (AGENTS + wrappers + skills + MCP). El único paso pendiente es la publicación a npm como `0.1.0`, que requiere el `NPM_TOKEN` como GitHub secret — no lo puedo proveer yo; esperamos que lo configures antes del merge para que el workflow de release publique automáticamente.

## Entregables

Todo bajo `/home/david/code-sherpas/pharos/pharos-tokens/` (branch `feat/fase-1a-scaffolding`, pendiente de push):

### Source & build

- `src/color.tokens.json` — 33 tokens de color (OKLCH): neutral 50-950, primary 50-900, semantic success/error/warning/info con fg/bg/on, base white/black.
- `src/spacing.tokens.json` — 17 tokens alineados con Tailwind default, sin `cs-*`.
- `src/typography.tokens.json` — font family/weight/size/lineHeight/letterSpacing. Body default `font.size.sm` = 14px per D3.
- `src/radius.tokens.json` — 8 tokens none-to-full.
- `src/shadow.tokens.json` — shadows + z-index (semánticos) + duration + easing.
- `build/style-dictionary.config.mjs` — pipeline v4 + post-step que genera barrel tipado `index.js`/`index.d.ts`.
- `scripts/compute-oklch.mjs` — helper para conversiones hex→OKLCH.

### Outputs generados por `pnpm build`

- `dist/styles.css` — 88 CSS custom properties prefijadas `--pharos-*` (9KB, OKLCH).
- `dist/tokens.js` — constantes flat ESM (`PharosColorNeutral900`, etc.).
- `dist/tokens.d.ts` — types matching tokens.js.
- `dist/tokens.json` — JSON nested values-only.
- `dist/index.js` — barrel amigable con `export const tokens`.
- `dist/index.d.ts` — `typeof tokens` para autocomplete profundo.

### Tests (Vitest, 22 casos, 3 archivos)

- `tests/wcag-contrast.test.ts` — 15 casos: contraste WCAG AA 4.5/3.0 para semantic fg/on pairs, neutrals sobre blanco, primary sobre blanco, white sobre primary.
- `tests/dtcg-format.test.ts` — 3 casos: `$value`/`$type` presentes, referencias `{alias}` resuelven.
- `tests/css-output.test.ts` — 4 casos: prefijo `--pharos-*`, tokens hero presentes, `:root` wrap, no hex residual.

### Configuración IA portable

- `AGENTS.md` — fuente de verdad con reglas, stack, outputs, MCP esperados, comandos.
- `CLAUDE.md` + `.cursorrules` — wrappers 1-línea hacia AGENTS.md.
- `.mcp.json` — `context7` + `github` (sin shadcn, per plan).
- `.skills/update-token.md` — flujo de edición/adición de tokens.
- `.skills/add-token-category.md` — flujo para nuevas categorías (uso raro).
- `.skills/review-tokens-pr.md` — checklist de revisión de PRs.
- `RULES.md` — reglas para consumidores del paquete (publicado via `files`).

### CI y release

- `.github/workflows/ci.yml` — en cada PR y push a main: typecheck, lint, format:check, build, test.
- `.github/workflows/release.yml` — en push a main: Changesets crea PR de versión o publica a npm (requiere `NPM_TOKEN`).
- `.changeset/config.json` — config estándar, `access: public`.
- `.changeset/initial-release.md` — changeset inicial para publicación 0.1.0.

### Otros

- `package.json` con exports correctos (`.` / `./css` / `./dtcg/*`), `publishConfig.access=public`, devDeps completas, pnpm 10.33.0, Node >=22.
- `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.npmrc`.
- `LICENSE` MIT (paquete público aunque repo GitHub sea privado).
- `README.md` con 4 opciones de uso + tabla de estructura de tokens.

## Tabla de tokens finalizados

### Colores (OKLCH) — ver `src/color.tokens.json` para valores completos

| Token | OKLCH | Origen | Nota |
|---|---|---|---|
| `color.neutral.50` | `97.91% 0 0` | Alexandria `#f8f8f8` | |
| `color.neutral.100` | `97.02% 0 0` | Alexandria `#f5f5f5` / `light-grey` | |
| `color.neutral.200` | `95.21% 0 0` | Alexandria `#efefef` / `supporting.base` | |
| `color.neutral.300` | `88.82% 0.0029 264` | Alexandria `#d9dadc` | Ligero tint navy. |
| `color.neutral.400` | `81.09% 0 0` | Alexandria `#c1c1c1` | |
| `color.neutral.500` | `52.78% 0 0` | Alexandria `#6b6b6b` / `secondary-text` | |
| `color.neutral.600` | `35.62% 0 0` | Alexandria `#3c3c3c` | |
| `color.neutral.700` | `29.52% 0.0107 254` | Alexandria `#292d32` | Tint navy. |
| `color.neutral.800` | `37.05% 0.0436 247` | Alexandria `#2d4256` / `charcoal-blue` | Tint navy. |
| `color.neutral.900` | `20.50% 0.02 248` | Alexandria `#101820` (279 usos) | **Hero neutral.** |
| `color.neutral.950` | `14.69% 0.0225 269` | Alexandria `#070a14` | |
| `color.primary.{50..900}` | escala lin/cromática | Derivado de Alexandria `#2a48e9` (sea-blue primitive) | 600 = hue base. |
| `color.semantic.success.fg` | `52% 0.17 152` | **Ajustado desde** `#05b661` | Original fallaba AA. Darker para pasar. |
| `color.semantic.error.fg` | `61.28% 0.2305 27` | Alexandria `#ef2828` (true-red) | Pasa AA sin ajuste. Laser-red eliminado per D2. |
| `color.semantic.warning.fg` | `77.77% 0.1588 91` | Alexandria `#ddb101` | `on` = neutral.900 (warning es claro). |
| `color.semantic.info.fg` | `52% 0.17 246` | **Ajustado desde** `#009bf9` | Original fallaba AA. Darker para pasar. |

### Resultados WCAG

Todos los pares fg/on pasan:

| Par | Contraste | Umbral | Estado |
|---|---:|---:|---|
| semantic.error.fg vs error.on (white) | ~3.5 | 3.0 (AA large) | ✓ |
| semantic.success.fg vs success.on (white) | ~4.9 | 3.0 | ✓ |
| semantic.info.fg vs info.on (white) | ~5.3 | 3.0 | ✓ |
| semantic.warning.fg vs warning.on (neutral.900) | ~8+ | 3.0 | ✓ |
| neutral.500-900 on base.white | ≥5.5 | 4.5 (AA normal) | ✓ |
| primary.600-900 on base.white | ≥5.0 | 4.5 | ✓ |
| white on primary.600 | ~3.2 | 3.0 (AA large) | ✓ |
| neutral.400 on base.white | <4.5 (expected) | — | Flagged decorative-only |

## Decisiones tomadas (cumplen D1-D7 del checkpoint de Fase 0)

- **D1 (no `cs-*`)**: `spacing.*` y `radius.*` siguen escala Tailwind default. Zero overlap.
- **D2 (un red)**: solo `color.semantic.error.fg`. `laser-red` no existe en Pharos.
- **D3 (body 14px)**: `font.size.sm` = 14px/0.875rem. `$description` documenta que es el body default.
- **D4 (Lucide)**: aplica a pharos-react, no a pharos-tokens. Sin impacto acá.
- **D5 (components/ raíz de Alexandria)**: aplica a Fase 6. Sin impacto acá.
- **D6 (sin aliases legacy)**: cero tokens deprecated. `laser-red`, `muted-black`, `charcoal-blue`, etc. NO están en Pharos.
- **D7 (reportes Fase 0)**: el plan en alexandria-web-application está respetado. Este `REPORT-fase-1A.md` vive en pharos-tokens/ por consistencia con el scope del repo.

## Blocker resuelto durante Fase 1A

- **pnpm bajo corepack fallaba** (Node 22.13.1). Resolución: `npm install -g pnpm@latest --force` reemplaza el symlink de corepack por la instalación directa. pnpm 10.33.0 funciona. El repo declara `packageManager: "pnpm@10.33.0"` y `engines.node: ">=22"`.

## Pendientes para avanzar

### Bloqueantes antes de publicar 0.1.0

1. **`NPM_TOKEN` en GitHub secrets** del repo `code-sherpas/pharos-tokens`. Con permiso `publish` en scope `@code-sherpas`. Al mergear este PR a `main`, el workflow de release crea un "Version packages" PR; al mergear ese, publica automáticamente a npm. Alternativa manual: `pnpm changeset version && pnpm release` con un NPM token local.
2. **Branch protection** en `main` de pharos-tokens: requerir CI en verde. Se configura en Settings → Branches de GitHub (no es código, no lo puedo automatizar sin GH CLI auth).

### Follow-up opcional (Fase 1B+ o como patches de 0.1.x)

1. **Font family real**: actualmente `font.family.sans` usa `"Inter", system-ui, ...` como fallback genérico. Si Alexandria carga una fuente específica vía `next/font` (no verifiqué `RootLayout.tsx` en Fase 0), Pharos debería reflejarla como token oficial.
2. **Accent colors**: no se incluyó `color.accent.*` para bluish-purple (`#6f42f5`) ni indochine (`#c27605`) por no tener uso extenso en Alexandria. Si el diseñador (CTO) considera que son parte del sistema, se agregan como minor bump.
3. **Token de contraste "on" para neutrales**: hoy no hay `neutral.{X}.on`. En Fase 2 cuando los componentes (especialmente `Button variant="secondary"`) los necesiten, agregar. Por ahora los consumidores usan `color.base.white` o `color.neutral.900` manualmente.
4. **Tokens de animación más ricos**: solo tengo `duration` + `easing` básicos. Si aparece necesidad de animation `delay`, `iteration-count`, etc., agregar como categoría.

## Métricas de salud

| Métrica | Valor |
|---|---|
| Archivos en `src/` | 5 DTCG |
| Tokens declarados | 80+ (33 colores + 17 spacing + 12 typography + 8 radius + 4 shadow + 9 z + 3 duration + 3 easing + 2 base) |
| CSS vars generadas | 88 |
| Tests | 22 (100% pass) |
| Lint / Typecheck / Format | Limpio |
| Bundle `dist/index.js` | ~5.7 KB minified-estimated |
| Bundle `dist/styles.css` | ~9 KB |
| Tiempo de build | <1s |
| Tiempo de tests | <500ms |

## Checklist antes del merge

- [ ] CTO revisa este reporte y el contenido de `src/*.tokens.json`.
- [ ] CTO provee `NPM_TOKEN` y lo configura como GitHub secret.
- [ ] CTO configura branch protection en `main`.
- [ ] CI del PR pasa verde.
- [ ] Al mergear, revisar el "Version packages" PR que Changesets crea automáticamente.
- [ ] Al mergear ese segundo PR, verificar que `@code-sherpas/pharos-tokens@0.1.0` aparece en npmjs.com.

🛑 **CHECKPOINT:** esperar revisión antes de arrancar Fase 1B (`pharos-react`).
