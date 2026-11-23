# ADR-0002: Estructura de UI por capas y design tokens

- **Estado**: Aceptado
- **Fecha**: 23 de noviembre de 2026
- **Relacionado**: ADR-0001

## Contexto

Queremos poder cambiar el diseño (colores, componentes, estilos) sin tocar páginas ni lógica. Con estilos escritos directamente en cada página, un cambio visual obliga a buscarlo pantalla por pantalla.

## Decisión

### Capas

```
src/
  styles/tokens.css     Única fuente de diseño: colores, colores de tipo, radios, sombras, fuente
  app/globals.css       Importa Tailwind y los tokens
  ui/                   Átomos del design system (Button, Card, cx). Sin conocimiento del dominio
  components/           Piezas compartidas con dominio (TypeBadge, LangSwitcher, MoveCard)
  features/<feature>/   UI de cada pantalla (pokemon-picker, team-builder, table)
  app/[lang]/**/page.tsx  Contenedores finos: leen datos e i18n, arman view models y componen features
  lib/                  Lógica pura (datos, reglas, reducer). Sin UI
  i18n/                 Diccionarios de textos
```

Dependencias permitidas (de arriba hacia abajo):

```
app → features → components → ui → styles/tokens.css
 └──→ lib, i18n
```

### Reglas

1. **Ningún color fuera de `styles/tokens.css`.** Los componentes usan solo las utilidades que generan los tokens (`bg-surface`, `text-muted`, `bg-type-l`…).
2. **`ui/` no conoce el dominio**: no importa de `lib`, `features`, `components`, `i18n` ni `data`.
3. **Contenedor y presentación separados**: las páginas leen datos y textos; `features/` y `components/` reciben props listas para mostrar y no importan los JSON de datos.
4. **`lib/` no tiene UI.**
5. **Variantes como funciones de estilo** (`buttonStyles`, `cardStyles`), para poder aplicarlas tanto a `<button>` como a `<Link>` sin duplicar clases.

Las reglas 1 a 4 se verifican en `src/architecture.test.ts`.

## Cómo cambiar el diseño

| Quiero cambiar… | Toco… |
|---|---|
| Paleta, modo oscuro, colores de tipo | `src/styles/tokens.css` |
| Radios, sombras, fuente | `src/styles/tokens.css` |
| Cómo se ve cualquier botón o tarjeta | `src/ui/Button.tsx`, `src/ui/Card.tsx` |
| Una pieza del dominio (badge de tipo, carta de ataque) | `src/components/<Pieza>.tsx` |
| La disposición de una pantalla | `src/features/<feature>/` |

## Consecuencias

- Un rediseño completo toca tokens y átomos, no páginas.
- Agregar un tema (por ejemplo, alto contraste) es redefinir las variables de `tokens.css` bajo un selector.
- Hay un poco más de código (view models en las páginas) a cambio de componentes sin dependencias de datos y fáciles de probar.
