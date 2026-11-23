# ADR-0001: Webapp estática con Next.js y datos generados en build desde PlakoroDB

- **Estado**: Aceptado
- **Fecha**: 22 de noviembre de 2026 (revisado el mismo día: un celular por jugador, clon sparse, PWA con workbox)
- **Contexto adicional**: ver `docs/DISCOVERY.md`
- **Nombre del proyecto**: **Oskoro**, con el subtítulo "Acompañante no oficial para partidas de Plakoro". El nombre no debe incluir "Plakoro" ni usar logos, tipografías o colores de Bandai o Pokémon.

## Contexto

Queremos una webapp para jugar Plakoro en físico con cartas japonesas. Cada jugador la usa en **su propio celular**: consulta la traducción de sus ataques y de los del Pokémon rival, arma su equipo de 4 ataques y lleva sus contadores (Enekoro del próximo turno, ataque bloqueado y HP).

- **Fuente de datos**: PlakoroDB (CC BY-NC 4.0), en Markdown con tablas de 14 filas por ataque; las etiquetas están traducidas en cada idioma.
- **Volumen**: 23 Pokémon y 205 ataques (crecerá con EB03 y EB04).
- **Uso**: principalmente en el celular, en la mesa, a veces sin buena señal.
- **Prioridad**: un stack sencillo y sin backend.

## Decisión

1. **Next.js (App Router) con export estático** (`output: 'export'`), TypeScript estricto y Tailwind CSS. Se fija la versión estable más reciente al iniciar el proyecto.
2. **Sin backend y sin persistencia de datos del usuario.**
   - La **configuración** (mi Pokémon, mis 4 ataques y el Pokémon rival) va en los search params de la URL, por ejemplo `/es/mesa?me=STC04-001&moves=STW04-001,...&rival=STC01-001`. No es persistencia: sobrevive al cambio de idioma y a una recarga sin escribir en el navegador. Se valida contra los datos (códigos existentes, 4 ataques del Pokémon elegido, sin repetir); si no es válida, se vuelve a la selección.
   - Los **contadores** (Enekoro del próximo turno, ataque bloqueado, primer turno y HP) se manejan con `useReducer` y se guardan en `sessionStorage` bajo una clave derivada de la configuración. Así sobreviven a una recarga y a que el navegador móvil descarte la pestaña. Al cerrar la pestaña se borran; si cambia la configuración, se empieza de cero. Toda lectura y escritura va en `try/catch` y, si el almacenamiento falla, la app sigue funcionando solo en memoria.
   - No se usan `localStorage`, cookies, cuentas ni analítica con datos personales. Los contadores no son datos personales y responden a una función pedida por el usuario, así que no requieren aviso de consentimiento.
3. **Pipeline de datos en build**:
   - `scripts/sync-plakorodb.ts` hace un clon parcial y sparse (`git clone --filter=blob:none --sparse` + `sparse-checkout set` de `database*/text`) en `vendor/PlakoroDB`, ignorado por git, y hace checkout del commit fijado en una constante del script. No se usa submódulo: el repo pesa ~716 MB por los PNG y cada clon los descargaría.
   - El build de producción no depende de `vendor/`: usa el JSON versionado.
   - `scripts/build-data.ts`:
     - Lee `database*/text/wazacards/**/*.md`, `characards.md` y `symbols.md`.
     - Parsea **por posición de fila**, nunca por etiqueta.
     - Traduce el tipo y la debilidad de las characards (vienen con nombre completo, como "Grass") a `EnergyType` usando `symbols.md`.
     - Normaliza la energía a un arreglo de tipos, el daño a número o `null` y detecta el `?` como `official: false`.
     - Combina cada idioma con el inglés como respaldo, campo por campo.
     - Valida con Zod y escribe `src/data/<lang>.json`, que queda versionado.
   - Pruebas con Vitest que comprueban los conteos esperados (23 Pokémon, 205 ataques) y casos concretos (por ejemplo, `STW04-001` es "Roer" en ES y "Gnaw" en EN).
4. **i18n** con el segmento de ruta `app/[lang]/...` y `generateStaticParams` para `es` y `en`, con `dynamicParams = false`. Los textos de interfaz van en `src/i18n/<lang>.json`. No se usa middleware. La raíz `app/page.tsx` redirige del lado del cliente a `/es` o `/en` según `navigator.language`. El selector de idioma cambia el segmento y conserva los search params.
5. **Sin imágenes oficiales.** Las cartas se dibujan con componentes propios y los iconos de tipo son propios. No se enlazan recursos de bandai-hobby.net ni se usan los PNG o .koro del repo.
6. **PWA** con manifest y un service worker generado después de `next build` con `workbox-build` (`generateSW` sobre `out/`), que precachea las rutas estáticas y el JSON de datos. No se usa `next-pwa`.
7. **Hosting** estático gratuito: Cloudflare Pages, Vercel o GitHub Pages. Para empezar se usa un subdominio gratuito (por ejemplo `oskoro.vercel.app`); el dominio `oskoro.app` está disponible y queda para después.

## Modelo de datos

```ts
type EnergyType = 'G'|'R'|'W'|'L'|'P'|'F'|'D'|'M'|'N'|'Y'|'C';
type Orientation = 'standing'|'handstand'|'faceUp'|'faceDown'|'sideways';
// De pie, De cabeza, Boca arriba, Boca abajo, De lado (mismo orden que las filas 9-13)

interface Move {
  code: string;            // "STW04-001" (identificador estable)
  set: 'ST'|'EB01'|'EB02'|'PR'|string;
  pokemonCode: string;     // "STC04-001"
  name: string;            // traducido, sin el "?"
  official: boolean;       // false si el nombre traía "?"
  japanese: string;        // "かじる"
  type: EnergyType;
  energy: EnergyType[];    // ["L"]
  damage: number | null;   // 10
  effect: string | null;   // efecto base
  orientations: Partial<Record<Orientation, string>>; // efectos por cara
}

interface Pokemon {
  code: string;            // "STC04-001"
  name: string;
  type: EnergyType;
  weakness: EnergyType;
  hp: number;              // 120
  set: string;
  moveCodes: string[];
}

interface DataBundle {
  lang: string;
  source: { repo: string; commit: string; license: 'CC BY-NC 4.0' };
  types: Record<EnergyType, { name: string; japanese: string }>;
  pokemon: Pokemon[];
  moves: Move[];
}
```

## Estructura sugerida

```
app/page.tsx                         redirección cliente a /es o /en
app/[lang]/page.tsx                  home: botón "Iniciar partida"
app/[lang]/elegir/page.tsx           elegir mi Pokémon (cuadrícula por set)
app/[lang]/elegir/[code]/page.tsx    lista visual de ataques y selección de 4
app/[lang]/rival/page.tsx            elegir Pokémon rival
app/[lang]/mesa/page.tsx             mis cartas, contadores y pestaña Rival
app/[lang]/acerca/page.tsx           créditos, licencia y aviso de "no oficial"
scripts/sync-plakorodb.ts
scripts/build-data.ts
scripts/build-sw.ts
src/components/MoveCard.tsx          tarjeta que imita la carta física
src/data/<lang>.json
src/lib/{team-rules,game-reducer,setup-url}.ts
vendor/PlakoroDB (clon sparse, ignorado por git)
```

## Tarjeta de ataque (`MoveCard`)

- **Visible en la lista**:
  - Título en japonés y título traducido.
  - Iconos de energía y daño, en la misma posición que en la carta física.
  - Código pequeño.
  - Etiqueta de "traducción de fans" si `official === false`.
- **Al expandir**: efecto base y los efectos de las 5 orientaciones.
- **Selección**: contador "N/4"; al llegar a 4 se deshabilitan los demás.
- **Listado**: se muestran siempre todos los ataques del Pokémon (entre 7 y 10), sin filtro de cartas propias.

## Reglas de dominio implementadas

- Equipo: 1 Pokémon y exactamente 4 ataques de ese Pokémon, sin repetidos.
- Mi mesa (un jugador por dispositivo):
  - Enekoro por turno: base 3; el primer turno del jugador que empieza es 2; modificadores ±N para el próximo turno, con mínimo 0.
  - El ataque marcado como usado queda bloqueado el turno siguiente.
  - HP propio: inicial 120, mínimo 0. Es secundario porque el juego físico trae un reloj de HP.
  - Rival: solo consulta de los ataques de su Pokémon; no se registran sus turnos.
- **No se automatizan efectos.** La app muestra el texto y el jugador ajusta los contadores a mano.

## Alternativas consideradas

- **Vite + React (SPA)**: igual de simple, pero sin páginas estáticas por Pokémon ni rutas compartibles con buen SEO. Sería válida si Next resulta pesado.
- **Astro**: excelente para contenido, pero el modo partida es muy interactivo y ahí Next/React es más directo.
- **Backend con base de datos**: innecesario. Los datos cambian cada pocos meses y el estado es local.
- **Leer PlakoroDB en tiempo de ejecución desde GitHub**: frágil, depende de la red y del formato. Se descarta a favor de generar los datos en el build.

## Consecuencias

- **Ventajas**:
  - Costo cero.
  - Funciona sin conexión.
  - Despliegue trivial.
  - Datos versionados y probados.
  - Agregar un set es actualizar el submódulo, volver a generar los datos y desplegar.
  - No se maneja información personal, así que no hace falta aviso de privacidad ni consentimiento.
- **Desventajas**:
  - No hay sincronización entre teléfonos.
  - Cerrar la pestaña reinicia los contadores (la configuración se conserva en la URL) y no se pueden guardar equipos.
  - Las actualizaciones de datos son manuales.
- **Obligaciones de licencia**:
  - La app debe ser no comercial: sin anuncios, ventas ni muros de pago.
  - Debe dar crédito visible a PlakoroDB (Jollto y colaboradores), con enlace y licencia CC BY-NC 4.0, e indicar que el texto fue adaptado.
  - Debe incluir el aviso de que no está afiliada a Pokémon, Bandai ni Nintendo.

## Criterios de aceptación del MVP

1. `npm run build` genera un sitio estático sin errores y con datos para `es` y `en`.
2. Al elegir Pikachu se listan sus 8 ataques. La tarjeta `STW04-001` muestra "かじる" junto con "Roer" (ES) o "Gnaw" (EN), 1 energía eléctrica y 10 de daño, y al expandirla muestra los efectos por orientación.
3. La selección permite exactamente 4 ataques del Pokémon elegido, sin repetir, y bloquea los demás al llegar a 4.
4. Mi mesa muestra mis 4 cartas, lleva Enekoro del próximo turno, ataque bloqueado y HP, y permite consultar todos los ataques del Pokémon rival.
4b. Cambiar de idioma en cualquier pantalla conserva la selección hecha.
5. La app no escribe en `localStorage`, cookies ni IndexedDB. Solo usa `sessionStorage` para los contadores de la partida en curso, además de la caché técnica del service worker. Al recargar Mi mesa se conservan los contadores.
6. Tras la primera visita, la app abre y funciona sin conexión.
7. La página "Acerca de" muestra la atribución, la licencia y el aviso de "no oficial".
