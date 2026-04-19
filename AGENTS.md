# pharos-tokens

Design tokens de Code Sherpas, publicados como `@code-sherpas/pharos-tokens`.
**Paquete agnóstico de tecnología**: sin React, sin Tailwind, sin dependencias
de framework. Consumible desde cualquier frontend (React, Vue, Svelte,
React Native) y desde backends (emails transaccionales, PDFs, reports).

## Stack

- Single-package repo (pnpm)
- TypeScript (solo para tipar los outputs)
- Style Dictionary v4 (compilador DTCG → CSS + JS)
- Formato DTCG (Design Tokens Community Group)
- Colores en OKLCH
- Vitest (WCAG contrast, DTCG format, CSS output)
- Changesets

## Filosofía

pharos-tokens es la **fuente única de verdad** de las decisiones visuales
atómicas de Code Sherpas. Todo lo que tiene un valor (color, espaciado,
radio, tipografía, shadow, animación, z-index) vive acá. Los componentes (en
`pharos-react`) y las apps (`alexandria-*`) consumen esto, no al revés.

Principios:

1. **Agnóstico de framework.** Zero dependencias de React, Vue, etc.
2. **Consumible en HTML plano.** Un email transaccional o un PDF
   generado server-side debe poder usar las CSS vars tal cual.
3. **Versionado independiente.** pharos-tokens tiene su propio semver;
   pharos-react declara qué versiones de tokens soporta.
4. **Accesibilidad validada.** Todos los pares color/on-color pasan
   WCAG 2.1 AA en CI.

## Reglas NO NEGOCIABLES

1. **Formato DTCG.** Todo token declarado sigue spec DTCG con `$value`,
   `$type`, `$description`.
2. **Colores en OKLCH.** No hex, no RGB. OKLCH es perceptualmente
   uniforme y facilita generar escalas consistentes.
3. **Naming con prefijo `pharos-`.** Todas las CSS vars de output
   llevan prefijo `--pharos-` para evitar colisiones.
4. **Tests de contraste en CI.** No se mergea un PR si un par
   color/on-color falla WCAG 2.1 AA.
5. **Referencias válidas.** Si un token referencia otro (`{color.base.white}`),
   el referenciado debe existir. CI lo valida.
6. **Changeset obligatorio.** Breaking change = major (renombrar/eliminar).
   Nuevo token = minor. Ajuste de valor sin renombrar = patch.
7. **No componentes ni estilos de UI.** Este paquete define valores,
   no estructuras visuales. Si alguien propone agregar un componente,
   va a `pharos-react`.
8. **Sin dependencies de runtime.** Solo `devDependencies`. El output
   publicado es data + tipos, nunca código ejecutable de terceros.

## Outputs del build

El comando `pnpm build` genera en `dist/`:

- `styles.css` — CSS custom properties prefijadas `--pharos-*` (canónico, multi-framework).
- `tokens.js` — constantes ESM flat (`PharosColorNeutral900`, etc.) para imports selectivos.
- `tokens.d.ts` — types TypeScript para las constantes flat.
- `tokens.json` — objeto nested values-only (para herramientas que procesan tokens genéricamente).
- `index.js` — barrel amigable con objeto nested (`tokens.color.neutral['900']`).
- `index.d.ts` — types del barrel (autocomplete por path).

Los DTCG source files crudos (`src/*.tokens.json`) se exponen vía subpath
`./dtcg/*` para consumidores avanzados que transformen con sus propias
herramientas (ej: iOS/Android token pipelines).

## Workflow para modificar un token

Ver skill `update-token` en `.skills/update-token.md`.

## Workflow para introducir una categoría nueva

Ver skill `add-token-category` en `.skills/add-token-category.md`.

## Origen de los valores

Los tokens actuales se derivan del análisis de Alexandria documentado en
`alexandria-web-application:feat/fase-0-analysis/ANALYSIS-tokens.md` y de las
decisiones arquitectónicas aprobadas del plan (`PLAN-pharos-alexandria.md`,
Fase 0 checkpoint, 2026-04-19).

**Ajustes vs Alexandria** por cumplimiento WCAG:

- `color.semantic.success.fg` y `color.semantic.info.fg` son versiones más
  oscuras de los valores de Alexandria (`#05b661`, `#009bf9`) para pasar
  AA 4.5:1 contra fondo blanco. Los valores Alexandria originales fallaban.

## MCP servers esperados

Este repo tiene `.mcp.json` con: `context7`, `github`. **No incluye
shadcn MCP** — este repo no trata con componentes.

**Cuándo usar cada uno:**

- **`context7`** → documentación live de Style Dictionary v4, spec DTCG
  (Design Tokens Community Group), OKLCH color space, TypeScript, culori.
  Usar antes de modificar la config de Style Dictionary o cuando necesites
  validar que un transform/format sigue la API actual.
- **`github`** → issues, PRs, releases. Usar para referenciar issues
  de consumidores (ej: "pharos-react necesita token `radius.full`")
  o al crear PRs.

## Comandos útiles

- `pnpm build` — compila DTCG a CSS + JS + types
- `pnpm test` — suite Vitest (WCAG contrast, DTCG format, CSS output)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm changeset` — crear un changeset
- `pnpm release` — (CI only) build + publish a npm
- `node scripts/compute-oklch.mjs` — helper para convertir hex de Alexandria a OKLCH
