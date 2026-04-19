# @code-sherpas/pharos-tokens

Design tokens de Code Sherpas. Agnóstico de framework. DTCG + Style Dictionary v4 + OKLCH.

## Qué hay acá

Este paquete define **los valores atómicos** del sistema visual de Code Sherpas: colores, spacing, radius, tipografía, shadows, z-index, duración y easing. Son consumibles desde cualquier frontend (React, Vue, Svelte, React Native) y desde backends (emails transaccionales, PDFs, reports).

No contiene componentes. Los componentes React viven en [`@code-sherpas/pharos-react`](https://github.com/code-sherpas/pharos-react) y consumen este paquete como peer dependency.

## Instalación

```bash
pnpm add @code-sherpas/pharos-tokens
# o npm / yarn
```

## Uso

### Opción A — CSS custom properties (recomendado)

Importar los tokens CSS en el entry point de tu app:

```css
@import '@code-sherpas/pharos-tokens/css';
```

Esto expone `--pharos-*` en `:root`. Usalos directamente o vía Tailwind arbitrary values:

```css
.button-primary {
  background: var(--pharos-color-primary-600);
  color: white;
}
```

```html
<div class="bg-[var(--pharos-color-neutral-900)] text-white p-[var(--pharos-spacing-4)]">…</div>
```

### Opción B — Objeto tipado (JS/TS)

```ts
import { tokens } from '@code-sherpas/pharos-tokens';

const darkSurface = tokens.color.neutral['900'];
const cardRadius = tokens.radius['2xl'];
```

Autocomplete completo gracias a `typeof tokens`.

### Opción C — Constantes flat (imports selectivos)

```ts
import { PharosColorPrimary600, PharosRadius2xl } from '@code-sherpas/pharos-tokens/tokens.js';
```

### Opción D — DTCG source (pipelines custom)

Para transformaciones propias (iOS, Android, Figma, etc.):

```ts
import colorDtcg from '@code-sherpas/pharos-tokens/dtcg/color';
// objeto DTCG con $value, $type, $description
```

## Reglas para consumidores

Ver [RULES.md](./RULES.md) — se publica con el paquete.

## Estructura de tokens

| Familia    | Path ejemplo                                                                           | Descripción                                                |
| ---------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Base       | `color.base.{white,black}`                                                             | Blanco y negro puros.                                      |
| Neutrals   | `color.neutral.{50..950}`                                                              | Escala de grises, ligeramente navy-tinted en los darks.    |
| Primary    | `color.primary.{50..900}`                                                              | Sea blue, escala 50-900. 600 es el hue base.               |
| Semantic   | `color.semantic.{success,error,warning,info}.{fg,bg,on}`                               | Success/error/warning/info. Pares `fg + on` pasan WCAG AA. |
| Spacing    | `spacing.{0..24}`                                                                      | Escala Tailwind-compatible en `rem`.                       |
| Radius     | `radius.{none,sm,md,lg,xl,2xl,3xl,full}`                                               | Esquina.                                                   |
| Typography | `font.{family,weight,size,lineHeight,letterSpacing}.*`                                 | Tipografía. Body default = `size.sm` (14px).               |
| Shadow     | `shadow.{sm,md,lg,xl}`                                                                 | Elevación.                                                 |
| Z-index    | `z.{0,header,above-header,modal-overlay,modal,drawer-overlay,drawer,dropdown,tooltip}` | Semánticas, no literales.                                  |
| Duration   | `duration.{fast,normal,slow}`                                                          | Transiciones.                                              |
| Easing     | `easing.{in,out,in-out}`                                                               | Cubic-bezier.                                              |

## Contribuir

1. `pnpm install`
2. Modificar o agregar tokens en `src/*.tokens.json` (formato DTCG).
3. `pnpm build` — verificar que Style Dictionary compila.
4. `pnpm test` — WCAG + DTCG validations deben pasar.
5. `pnpm changeset` — declarar tipo de cambio (patch / minor / major).
6. PR.

CI valida contraste WCAG 2.1 AA en todos los pares color/on-color. Un PR no mergea si rompe contraste.

## License

MIT. Ver [LICENSE](./LICENSE).
