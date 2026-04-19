---
name: update-token
description: Usar cuando un dev o el CTO quiere modificar o agregar un token existente en pharos-tokens. Guía el proceso de editar el DTCG, rebuild, validar WCAG si es color, decidir el bump de versión correcto y documentar impacto en consumidores.
triggers:
  - 'update token'
  - 'modificar token'
  - 'cambiar valor de un token'
  - 'agregar un token'
---

# Update or add a token in pharos-tokens

## 1. Identify the right source file

Tokens viven en `src/*.tokens.json` agrupados por categoría:

- `src/color.tokens.json` — colores
- `src/spacing.tokens.json` — spacing
- `src/typography.tokens.json` — font family/weight/size/lineHeight/letterSpacing
- `src/radius.tokens.json` — border radius
- `src/shadow.tokens.json` — shadow, z, duration, easing

Si el token no encaja en ninguna categoría existente, probablemente necesitás el skill `add-token-category` en su lugar.

## 2. Edit the DTCG source

Todo token sigue el formato DTCG:

```json
"keyName": {
  "$value": "oklch(... % ... ...)",
  "$type": "color",
  "$description": "Descripción breve del uso + si reemplaza algo de Alexandria."
}
```

Reglas:

- Colores siempre en `oklch(...)`. Si tenés hex, convertilo con `node scripts/compute-oklch.mjs` o `culori`.
- Mantené `$description` — lo consume el CSS output como comentario.
- Si referenciás otro token: `"$value": "{color.base.white}"`.

## 3. Rebuild

```bash
pnpm build
```

Verificá que genera:

- `dist/styles.css`
- `dist/tokens.js` + `dist/tokens.d.ts` + `dist/tokens.json`
- `dist/index.js` + `dist/index.d.ts`

## 4. Run tests

```bash
pnpm test
```

Lo que se valida:

- **WCAG 2.1 AA** para todo color nuevo y su `on-*` par.
- **DTCG format**: `$value` + `$type` presentes.
- **Referencias válidas**: si usaste `{alias}`, debe apuntar a token existente.
- **CSS output**: todos los tokens declarados aparecen como `--pharos-*`.

Si algún test falla, ajustar el token (ej: darker L en OKLCH si falla WCAG) hasta pasar.

## 5. Decidir el bump de versión

| Tipo de cambio                       | Bump             |
| ------------------------------------ | ---------------- |
| Renombrar o eliminar un token        | major (breaking) |
| Agregar un nuevo token               | minor            |
| Ajustar valor sin renombrar/eliminar | patch            |

```bash
pnpm changeset
```

Elegí el tipo y describí el cambio. El texto del changeset va al CHANGELOG público.

## 6. Documentar impacto en consumidores

Si el cambio es:

- **major**: agregá al changeset una nota explícita "BREAKING:" y listá qué tokens cambian de path. Los consumidores (`pharos-react`, `alexandria-*`) van a necesitar una migración.
- **minor**: mencioná en el changeset "Nuevo token `X` para caso de uso Y".
- **patch**: el changeset puede ser corto ("ajuste de valor para mejorar contraste"). Aun así, si es color, anotá el delta visual esperado.

## 7. Abrir PR

- Conventional commit: `feat(color): add color.accent.purple` o `fix(color): darken success.fg to pass AA 4.5`.
- CI debe pasar verde (lint, typecheck, build, test).
- Si el cambio afecta naming canónico o semántica, pingear al CTO para review.

## 8. Tras merge

Release automática. El CI publica el nuevo version a npm vía Changesets. Verificá que la versión nueva aparece en [npmjs.com/package/@code-sherpas/pharos-tokens](https://www.npmjs.com/package/@code-sherpas/pharos-tokens).

Para consumidores downstream (`pharos-react`), correr su skill `upgrade-tokens-version`.
