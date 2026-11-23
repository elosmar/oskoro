# Discovery: Oskoro, acompañante no oficial para partidas de Plakoro

Fecha: 22 de noviembre de 2026
Estado: alcance acordado (revisado el 22/11/2026: un celular por jugador, consulta del rival, clon sparse en vez de submódulo)

## 1. Problema

Las cartas de movimiento (Wazacards) de Plakoro solo existen en japonés. Al jugar en físico con amigos hay que usar Google Translate carta por carta, lo que es lento, inexacto en los efectos y rompe el ritmo de la partida.

## 2. Usuarios y escenarios

- **Jugador en la mesa**: tiene su Charakoro y sus cartas japonesas; necesita saber qué hace cada ataque y su efecto según la cara del Charakoro, sin salir de la partida.
- **Jugador armando equipo**: quiere ver los ataques disponibles de un Pokémon, elegir 4 y llevar esa selección a la mesa.
- **Jugador frente al rival**: la carta que juega el rival también está en japonés y su efecto lo afecta; necesita leerla sin pedirle el teléfono ni usar un traductor.

Cada jugador usa **su propio celular**. La app es una ayuda visual para la partida en persona, no un lugar donde dos jugadores juegan a la vez.

## 3. Hallazgos

### 3.1 PlakoroDB (https://github.com/Jollto/PlakoroDB), revisado en el commit 13abfe4 del 21/11/2026

- **Cobertura**: 23 Pokémon (11 del Starter, 6 de EB01, 6 de EB02) y **205 ataques** (77 del Starter, 119 de Exploration Box y 9 promo).
- **Idiomas**: inglés (base), español, italiano y portugués traducidos; neerlandés casi sin traducir (cae a inglés). Las traducciones llegan vía Crowdin.
- **Formato**: Markdown con una tabla por ataque, siempre de **14 filas** en el mismo orden: Nombre, Japonés, Tipo, Código, Pokémon, Energía, Daño, Efecto, De pie, De cabeza, Boca arriba, Boca abajo, De lado. Lo verifiqué con un script: los 205 ataques en EN y en ES cumplen la estructura.
- **Ojo**: en cada idioma las etiquetas de las filas también están traducidas ("Name" pasa a "Nombre"). El parser debe leer **por posición de fila**, no por etiqueta.
- **Energía**: tokens tipo `{L}{L}{W}` con 11 tipos (G, R, W, L, P, F, D, M, N, Y, C). La tabla de equivalencias está en `symbols.md` de cada idioma.
- **Daño**: entero o vacío (14 ataques sin daño base).
- **Nombres no oficiales**: 56 ataques llevan `?`, que indica una traducción propuesta por fans. Conviene mostrarlo en la interfaz.
- **Characards**: nombre, tipo, código (por ejemplo STC04-001), debilidad y HP (120).
- **Extras útiles**: FAQ oficial traducido (58 preguntas, sirve como referencia de reglas), reglas de eventos y nombres originales.
- **Archivos .koro**: son JSON para el Plakoro Card Maker. Los de characards incluyen la imagen embebida como un arreglo enorme, así que **no hay que usarlos**: el Markdown basta.
- **Peso**: el repo ocupa ~716 MB, casi todo imágenes PNG de cartas. **No conviene empaquetar imágenes**: la app debe dibujar sus propias cartas a partir del texto. Por lo mismo, **no conviene un submódulo de git** (cada clon descargaría los PNG); basta un clon parcial y sparse de `database*/text`.
- **Characards**: el tipo y la debilidad vienen con nombre completo ("Grass"), no como token; se traducen con `symbols.md`. No traen nombre en japonés.
- **Licencia**: **CC BY-NC 4.0**. Se puede usar si la app es **no comercial**, da **atribución** (autor, enlace y licencia) e **indica los cambios**. Esta licencia no cubre el arte, los logos ni el texto japonés de Pokémon y Bandai.

### 3.2 Reglas que afectan la app (FAQ y reglas de eventos)

- Cada jugador usa 1 Pokémon y 4 Wazacards, todas de ese Pokémon y **sin repetir**.
- No se puede usar la misma Wazacard dos turnos seguidos.
- El primer jugador tira 2 Enekoro en su primer turno; lo normal es 3.
- Muchos efectos modifican **cuántos Enekoro tiras el próximo turno** (±1 o ±2, con mínimo 0). Con 0 Enekoro solo se tira el Charakoro.
- Hay efectos que se repiten mientras sigas teniendo éxito (Electric Rush) y efectos que evitan daño (Fly).
- La debilidad suma +20 de daño.
- En eventos, si se acaba el tiempo, gana quien tenga más HP; si hay empate, se decide con piedra, papel o tijera.

### 3.3 Competencia: PokéDices (https://pokedices.online)

- Se describe como un "acompañante multilingüe y open source" con cartas traducidas, dados de energía digitales y control de HP.
- **Ya cubre buena parte de la idea.** Decisión: **app propia, diferenciada** por:
  - Lista visual de ataques que imita la carta física, con título en japonés y traducido.
  - Selección de 4 ataques que valida las reglas.
  - Recordatorio del ataque bloqueado (no se puede repetir dos turnos seguidos).
  - Consulta rápida de los ataques del Pokémon rival.
  - Prioridad al español y uso sin conexión.

## 4. Propuesta de alcance

### Principios del MVP
- **Apoyo para partidas reales**: la app acompaña una partida física; no es un simulador ni una colección.
- **No guarda información personal**: sin cuentas, sin equipos guardados y sin `localStorage`. Solo los contadores de la partida en curso se guardan en `sessionStorage`, que se borra al cerrar la pestaña.

### Flujo principal
**Home ("Iniciar partida") → elegir tu Pokémon → elegir tus 4 ataques → elegir el Pokémon rival → Mi mesa.**

### MVP (v1)
1. **Home**: un botón "Iniciar partida" y el selector de idioma.
2. **Elegir Pokémon**: cuadrícula de los 23 Pokémon agrupados por set (Starter, EB01, EB02).
3. **Lista visual de ataques** del Pokémon elegido. Cada Pokémon tiene entre 7 y 10:
   - Altaria y Dragonite tienen 7.
   - Los demás del Starter tienen 8 (7 más 1 promo).
   - Los de Exploration Box tienen 9 o 10 (2 variantes por Pokémon).

   Cada tarjeta imita la carta física para reconocerla de un vistazo:
   - Título en **japonés** y en el **idioma elegido**.
   - **Iconos de energía** y **número de daño** en la misma posición que en la carta real.
   - **Código** pequeño (por ejemplo `STW04-001`).
   - Etiqueta de "traducción de fans" si el nombre lleva `?`.

   Al tocar se elige el ataque y un contador muestra "2/4"; al llegar a 4 se bloquean los demás. Al expandir se ven el efecto y las 5 orientaciones del Charakoro.

   No hay filtro de "las que tengo": siempre se listan todos los ataques.
4. **Elegir Pokémon rival**: la misma cuadrícula. No hace falta saber sus 4 ataques.
5. **Mi mesa** (un jugador por celular):
   - **Mis cartas**: los 4 ataques en tarjetas grandes. Al tocar una se ven el efecto y las 5 caras del Charakoro; al tocar la cara que salió se resalta su efecto.
   - **"Usé este ataque"**: lo marca como usado y queda bloqueado visualmente el turno siguiente.
   - **Turno**: "Terminar turno" avanza el turno y aplica el bloqueo del ataque usado. En el turno 1 se recuerda que el que empieza tira solo 2 Enekoro (texto, sin contador).
   - **HP propio** (secundario y compacto): empieza en 120, con botones de ±10 y ±20. El juego físico trae un reloj para esto, así que en la app es opcional para el jugador.
   - **Pestaña "Rival"**: lista todos los ataques del Pokémon rival (de 7 a 10). Al tocar el que jugó se ven su traducción y su efecto por cara. Si el efecto te afecta, ajustás tus contadores a mano.
6. **Idiomas**: interfaz y datos en ES y EN, intercambiables en cualquier momento sin perder la selección.
7. **Funciona sin conexión** (PWA), para jugar en tiendas con mala señal.

La configuración (tu Pokémon, tus 4 ataques y el Pokémon rival) viaja en la URL, así sobrevive al cambio de idioma y a una recarga sin guardar nada en el navegador. Los contadores (turno, HP y ataque bloqueado) se guardan en `sessionStorage`, asociados a esa configuración. Así sobreviven a una recarga y a que el navegador del celular descarte la pestaña en segundo plano (por ejemplo, al salir a otra app). Al cerrar la pestaña o cambiar la configuración, arrancan de cero.

### Fuera de alcance en v1
- Guardar equipos, historial o cualquier dato del usuario.
- Filtro de "las cartas que tengo".
- Buscador por código o nombre japonés fuera de la lista (posible v2).
- Multijugador en línea y sincronización entre teléfonos.
- Modo de dos jugadores en un solo dispositivo.
- Registro de turnos del rival (qué ataque usó, si funcionó, si aplicó el efecto).
- Cuentas.
- Resolución automática de efectos.
- OCR o lectura de cartas con la cámara.
- Imágenes oficiales de cartas.
- Dados digitales con chips personalizados.

### Ideas para v2
Buscador global por código o nombre japonés, registro de turnos del rival, recordatorio de efectos diferidos sobre los Enekoro ("Próximo turno: −1 Enekoro"; afectan a 28 de 205 ataques, todos de Exploration Box), dados digitales que respeten los chips de cada Enekoro, OCR y sincronización entre dos teléfonos (requeriría un servicio en tiempo real).

## 5. Requisitos técnicos

- **Sin backend y sin persistencia**: todo es estático. Los datos se generan en el build a partir de PlakoroDB. La configuración va en la URL y los contadores en `sessionStorage`. No se usan `localStorage`, cookies ni analítica con datos personales.
- **Stack**: Next.js (App Router) con `output: 'export'`, TypeScript, Tailwind CSS, Zod (validación de datos) y Vitest (pruebas del parser).
- **Datos**:
  - `scripts/sync-plakorodb.ts` hace un clon parcial y sparse (`--filter=blob:none --sparse`) de PlakoroDB **fijado a un commit**, trayendo solo `database*/text` a `vendor/PlakoroDB` (ignorado por git).
  - El script `scripts/build-data.ts` convierte el Markdown en JSON por idioma (`src/data/<lang>.json`), lo valida con Zod y lo deja versionado en el repo, para que el build no dependa de la red.
  - Para idiomas incompletos se usa el inglés como respaldo, campo por campo.
- **i18n**: segmento `[lang]` con `generateStaticParams`; textos de interfaz en JSON. No se usa middleware, porque no funciona con export estático. La raíz `/` redirige del lado del cliente a `/es` o `/en` según `navigator.language`.
- **Imágenes**: ninguna oficial. Iconos de tipo propios (colores y letras), sin enlazar los recursos de bandai-hobby.net.
- **PWA**: manifest y service worker generado después del build con `workbox-build` sobre `out/` (sin `next-pwa`, que está abandonado).
- **Hosting**: gratuito en Cloudflare Pages, Vercel o GitHub Pages.
- **Calidad**: pruebas del parser con conteos esperados (23 Pokémon, 205 ataques), tipos estrictos y lint en CI.

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cambia el formato de PlakoroDB | Commit fijado en `sync-plakorodb.ts`, validación con Zod y pruebas con conteos; actualizar a mano |
| Salen sets nuevos (EB03 en enero de 2027, EB04 en marzo de 2027) | Actualizar el submódulo y volver a generar los datos; la app no se modifica |
| Traducciones no oficiales (`?`) | Mostrar una etiqueta de "traducción de fans" |
| Reclamo de derechos de Pokémon o Bandai | Proyecto no comercial, aviso de "no oficial", sin arte oficial y disposición a retirar contenido |
| Interpretación equivocada de efectos | No automatizar efectos: solo mostrar el texto y contadores simples; enlazar el FAQ |
| Duplicar a PokéDices | App propia con diferenciadores claros (ver 3.3) |

## 7. Preguntas abiertas

1. ¿El código (`STW04-001`) viene impreso en la carta física? Si no, se quita de la tarjeta para no confundir. Hay que verificarlo con tus cartas.
2. **Movimiento especial**: los datos de PlakoroDB no marcan ningún ataque como "especial". ¿Existe en la 2ª edición o solo en la de 1997? Mientras no se confirme, no habrá validación de "máximo 1 especial".
3. ~~¿Contribuimos a PokéDices o hacemos una app propia?~~ Resuelto: **app propia**.
4. ~~¿Qué idiomas lleva la v1, solo ES y EN?~~ Resuelto: **ES y EN**, intercambiables en cualquier momento.
5. ~~¿Nombre y dominio del proyecto?~~ Resuelto: **Oskoro**. Primero se publica en un subdominio gratuito; `oskoro.app` está disponible y queda para después.
