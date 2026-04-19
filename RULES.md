# Reglas para consumidores de `@code-sherpas/pharos-tokens`

Este archivo se publica con el paquete (`files` incluye `RULES.md`). Todo
consumidor — `pharos-react`, `alexandria-web-application`, `alexandria-design`,
y cualquier app futura — debe respetar estas reglas.

## 1. No redefinir valores localmente

Los tokens son la única fuente de verdad. Prohibido:

- Hex hardcoded para colores que tienen token equivalente (ej: `#101820` cuando existe `--pharos-color-neutral-900`).
- Valores `rem`/`px` para spacing cuando existe `--pharos-spacing-*`.
- Shadows locales ad-hoc.

Si un valor no tiene token, abrí issue en este repo. No improvises.

## 2. No inventar colores fuera del sistema

El sistema es: `color.neutral.*`, `color.primary.*`, `color.semantic.{success,error,warning,info}.*`, `color.base.{white,black}`. Si necesitás un accent nuevo (purple, amber, etc.) con semántica clara, abrí issue — no lo agregues localmente.

## 3. Usar CSS vars o el objeto JS

**Web**: importar `@code-sherpas/pharos-tokens/css` en el entry point y usar `var(--pharos-*)` o `arbitrary values` Tailwind (`bg-[var(--pharos-color-primary-600)]`).

**Programático** (JS/TS): `import { tokens } from '@code-sherpas/pharos-tokens'` → `tokens.color.neutral['900']`.

**DTCG source** (para pipelines custom): `import dtcg from '@code-sherpas/pharos-tokens/dtcg/color'`.

## 4. No modificar valores tras importar

Prohibido: `tokens.color.primary['600'] = '#new'`. El objeto es frozen in spirit aunque JS no lo enforce. Cambios pasan por PR a este repo.

## 5. Respetar semver

- Breaking change en este repo → major bump → consumidores actualizan explícitamente.
- Nuevo token → minor bump → consumidores pueden adoptar sin romper nada.
- Ajuste de valor sin renombrar → patch → consumidores reciben mejoras visuales automáticas.

## 6. Accesibilidad

Al elegir qué tokens usar, respetar los pares definidos:

- Texto sobre `color.neutral.50`/`100`/`200`: usar `color.neutral.900` o más oscuro.
- Texto sobre `color.primary.600`+: usar `color.base.white`.
- Texto sobre `color.semantic.{success,error,info}.fg` (filled): usar `.on` del mismo grupo.
- Texto sobre `color.semantic.warning.fg`: `.on` es `color.neutral.900` (warning es claro).

Cualquier combinación fuera de estas pasa por review visual con el CTO.

## 7. Extensiones y overrides

**No** hagas un nuevo paquete `@yourorg/pharos-tokens-extended`. Si el producto necesita tokens propios (ej: branding co-marcado), implementar como CSS vars adicionales en el consumidor, en un namespace propio (`--myapp-*`), y documentar.
