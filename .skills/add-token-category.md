---
name: add-token-category
description: Usar cuando aparece una necesidad de tokens en una categoría completamente nueva (ej: tokens de animación timeline, de border-width, de opacity scale) que no encaja en color/spacing/typography/radius/shadow actuales.
triggers:
  - "nueva categoría de tokens"
  - "add token category"
  - "añadir tipo de token"
---

# Add a new token category to pharos-tokens

Casi nunca es necesario — la mayoría de tokens encajan en las 5 categorías existentes. Consultar al CTO antes de iniciar este flujo.

## 1. Validar que no encaja en una categoría existente

Antes de crear una categoría nueva, considerá:

- **animación/transition** → ya hay `duration` y `easing` en `shadow.tokens.json`.
- **border-width** → podría ir en `radius.tokens.json` (o se crea `border.tokens.json`).
- **opacity** → en `color.tokens.json` como alias con `/` (ej: `oklch(... / 0.5)`).
- **breakpoints** → no son tokens de Pharos — viven en el consumidor (Tailwind config).

Si tras revisar, genuinamente requiere nueva categoría, seguir abajo.

## 2. Crear el archivo DTCG

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

`$type` válidos DTCG: `color`, `dimension`, `duration`, `cubicBezier`, `fontFamily`, `fontWeight`, `number`, `shadow`, `strokeStyle`, `transition`, `typography`, `border`, `gradient`.

## 3. Registrar en Style Dictionary

Style Dictionary ya usa `src/**/*.tokens.json` como source, por lo que el archivo nuevo se detecta automáticamente. No hay que tocar `build/style-dictionary.config.mjs`.

## 4. Extender tests

Si la categoría tiene validaciones específicas (ej: "toda animación dura entre 50ms y 1000ms"), agregar test en `tests/<category>.test.ts`.

## 5. Documentar

- Actualizá `README.md` tabla "Estructura de tokens".
- Actualizá `RULES.md` si corresponde.
- Actualizá `AGENTS.md` si cambia el workflow.

## 6. Cambio semver

Categoría nueva = minor bump (nuevos tokens sin romper existentes). Changeset correspondiente.

## 7. Informar consumidores

Abrí issues en los repos que puedan aprovechar la categoría nueva (`pharos-react`, `alexandria-*`) explicando los nuevos tokens disponibles.
