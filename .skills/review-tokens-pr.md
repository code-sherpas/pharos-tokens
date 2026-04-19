---
name: review-tokens-pr
description: Usar cuando hay que revisar un PR de pharos-tokens. Checklist exhaustivo de formato DTCG, contraste WCAG, naming canónico, referencias válidas, changeset presente.
triggers:
  - 'review this PR'
  - 'review pharos-tokens pr'
  - 'revisar PR de tokens'
---

# Review a pharos-tokens PR

Checklist ordenado por prioridad. Si falla alguno de los primeros 5, el PR no merge sin corrección.

## 1. Formato DTCG

- [ ] Cada token tiene `$value`, `$type`, `$description`.
- [ ] `$type` corresponde al valor (ej: `color` para OKLCH string, `dimension` para `rem`/`px`, `duration` para `ms`).
- [ ] Los DTCG `.tokens.json` parsean sin errores (JSON válido).

## 2. Naming

- [ ] Path del token sigue la jerarquía existente (`color.{neutral,primary,semantic.*,base}`, `spacing.*`, `radius.*`, `font.*`, `shadow.*`, `z.*`, `duration.*`, `easing.*`).
- [ ] Escala numérica para colores (50..900 o 50..950) o semántica clara (fg/bg/on).
- [ ] CSS vars output se prefija `--pharos-*` (verificado automáticamente por el CSS output test).

## 3. Colores: formato y contraste

- [ ] Colores son OKLCH, no hex ni RGB ni HSL.
- [ ] Si se agrega un nuevo color, el test `wcag-contrast.test.ts` incluye el par fg/on correspondiente.
- [ ] El par pasa AA: 4.5:1 (texto body) o 3:1 (texto grande/bold).
- [ ] Si el valor Alexandria-original fallaba WCAG, el `$description` documenta el ajuste.

## 4. Referencias

- [ ] Si el `$value` es `{alias}`, el alias existe y apunta al token correcto.
- [ ] Test `dtcg-format.test.ts > references resolve` pasa.

## 5. Changeset

- [ ] `.changeset/*.md` presente para todo cambio que afecte el API público.
- [ ] Bump correcto:
  - major para renombres/eliminaciones
  - minor para tokens nuevos
  - patch para ajustes de valor sin rename
- [ ] Changeset incluye explicación del motivo + impacto esperado en consumidores.

## 6. Tests y build

- [ ] `pnpm build` genera los 6 artefactos esperados sin warnings nuevos.
- [ ] `pnpm test` pasa los 22+ tests.
- [ ] `pnpm typecheck` y `pnpm lint` limpios.

## 7. Documentación

- [ ] Si la categoría es nueva: README.md tabla actualizada, RULES.md extendida.
- [ ] Si hay breaking: PR description enlaza a `TOKEN-migration-map.md` o equivalente para que consumidores sepan cómo migrar.

## 8. Side effects

- [ ] Ninguna dependencia nueva de runtime (solo devDependencies aceptadas).
- [ ] Bundle del `dist/` no crece significativamente (< 10KB total para el objeto JS).
- [ ] Output sigue siendo consumible como CSS plano (email transaccional test).

## Decisión

- Si todo ✅ → aprobar y dejar merge.
- Si falla 1-5 → request changes con feedback específico.
- Si falla 6-8 → commit fix sobre el mismo branch o coordinar con el autor.
