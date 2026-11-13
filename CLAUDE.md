# Boda de Arjan & Reliana

La especificación completa está en [BRIEF.md](BRIEF.md). Sus textos son placeholders genéricos.
**Este archivo manda sobre el brief** cuando hay diferencias.

## Decisiones tomadas (sustituyen las «decisiones abiertas» del brief §10)

- **Novios:** Arjan Hoxha y Reliana Shehaj (en este orden: Arjan primero; monograma del lacre «A&R»). Son albaneses.
- **Boda:** viernes 9 de julio de 2027 en Tirana, Albania. **Empieza a las 19:00** (hora de Tirana). Zona horaria `Europe/Tirane` (+02:00 en verano).
- **Idiomas:** albanés (`sq`, por defecto, en `/`), inglés (`/en/`) y alemán (`/de/`). Selector siempre visible.
  Hay que traducir todo texto visible a los tres idiomas. Albanés y alemán: los revisa un nativo.
- **Invitación:** genérica (mismo enlace para todos, uno por idioma).
- **Dirección visual:** «correspondencia» del brief §7 con un guiño albanés: el forro del sobre lleva un patrón
  inspirado en el bordado tradicional albanés y el lacre es rojo profundo (`--lacre: #8e1b24`).
- **Tratamiento:** albanés con «ju», alemán con «du», inglés con «you».
- **Lugar:** ceremonia (no religiosa) y fiesta en el mismo sitio: La Gert Grand Palace, Tirana.
  Una sola tarjeta en «Cuándo y dónde».
- **Fuera del brief:** sin autobús ni transporte (no hay sección ni paso 4 en el formulario,
  ni columnas `bus_*` en la hoja) y sin regalo ni IBAN.
- **Música** (decisión revertida: al principio se dijo «sin música»): «A Thousand Years» (The Piano Guys) suena al abrir el sobre.
  `public/audio/cancion.mp3` (112 kbps, 3,7 MB; original en `originales/audio/`), `Music.astro`, botón de silencio arriba a la izquierda,
  se recuerda si se silencia (`localStorage`), no suena sola al saltar la intro. Es una grabación con derechos de autor.

- **Sobre:** versión del prototipo `invitacion-reliana-arjanfromClaude.html` portada a `Envelope.astro` + `src/scripts/intro.ts`
  (cuatro solapas, relieve de olivo, lacre con corona). Beige `#E3D6BF` por defecto; rojos con lacre dorado.
  El panel de pruebas (botón de paleta abajo a la izquierda: estilo de acuarela + color del sobre) es provisional:
  se quita al elegir definitivo (bloque `data-proto` en `Envelope.astro` y su código en `intro.ts`).
- **Interior:** acuarela procedural en SVG (`Wash.astro`, `Branch.astro`, filtros en `WatercolorDefs.astro`,
  generadores en `src/lib/watercolor.ts`). Tres estilos por `html[data-style]` (`olivo`, `burdeos`, `azul`) con
  `--accent` y `--wash-1/2/3` en `tokens.css`. Foto de la sección tras la cuenta atrás: `src/assets/historia.webp`, banner apaisado de la familia con los textos recortados (`originales/historia-banner.png`), bordes difuminados por máscara CSS. Hay también dos versiones con marco generado en `originales/`.
- **Decoración del sobre** (selector de pruebas, tres ajustes independientes que se combinan; `intro.ts`):
  laterales (relieve **sutil** por defecto / clásico / olivo dibujado por código), arriba y abajo (**medallones** por defecto /
  enredaderas diagonales / marco horizontal / sin nada) e intensidad (fuerte / **media** por defecto / suave: transparencia + menos color
  + menos contraste). Imágenes de yeso con alfa en `src/assets/envelope/`, originales en `originales/sobre/`.
  Cada imagen se incrusta en el dibujo de su solapa (bandas que se curvan), recortada al triángulo y ajustada a él (`placeDeco`,
  `vine`, `medallion`). No se siguió el LEEME (imagen como capa aparte): no encaja con las solapas por bandas.
  Decisión del usuario: nada de tiras horizontales arriba/abajo porque «enmarcan» y el sobre no debe enmarcar.
- **Estilo «relieve clásico»** (`html[data-style='relieve']`, **estilo por defecto**; fijado en `Base.astro`): invitación impresa en relieve.
  Usa los relieves de yeso aportados (`originales/recurso*.png`, convertidos a WebP con alfa en `src/assets/relieve/`):
  corona superior, remate inferior, guirnaldas laterales y separador (`ReliefDecor.astro`). Se tiñen hacia marfil con un
  filtro CSS. Reglas en `src/styles/relieve.css`. Muestra los nombres completos: Reliana Shehaj y Arjan Hoxha, en
  caligrafía dorada y mayúsculas separadas (Cormorant Garamond). En este estilo no salen las flores/ramas dibujadas
  por código (esas son de la acuarela). El estilo de acuarela original no se toca.
- **Hoja de Google:** en inglés (pestaña `Responses`; columnas `contact, name, attending, extra_adults, adult_names, menus, allergies, language, submitted_at, id`).
  Tras cambiar `apps-script/Code.gs` hay que pegarlo en el editor y desplegar una **nueva versión** (guardar no basta). URL del despliegue en `.env` (`PUBLIC_RSVP_ENDPOINT`).
- **Formulario:** pasos Tú → Acompañantes (adultos) → Comida (menú y alergias) → Resumen. Sin niños, canción ni mensaje.

## Dónde está cada cosa

- `src/data/boda.ts`: todo el contenido. Los textos traducibles son objetos `{ sq, en, de }` (tipo `L`).
- `src/i18n/ui.ts`: idiomas y textos de interfaz (botones, títulos de sección).
- `src/i18n/format.ts`: fechas con `Intl` en hora de Tirana; `fill()` sustituye `{deadline}`.
- `src/components/Invitation.astro`: compone la página; `src/pages/{,en/,de/}index.astro` solo eligen idioma.
- Enlaces entre idiomas con `getRelativeLocaleUrl` de `astro:i18n`; rutas de recursos con `import.meta.env.BASE_URL`.

## Comandos

Node 22 (`.nvmrc`). Astro 7 exige Node ≥ 22.12.

- `npm run dev`: servidor con `--host` para probar en el móvil desde la IP local.
- `npm run build` / `npm run preview`.
- `npm run check`: tipos.

## Publicación

- Web: **https://dasmaarjanreliana.com** (repo `juandelaoliva/ArjandheReli`, GitHub Pages con Actions; el dominio sale del archivo `CNAME`).
- Cada push a `main` despliega. El selector de pruebas solo existe en `npm run dev`.

## Desarrollo

Todo en local por ahora. El workflow `.github/workflows/deploy.yml` ya está listo para cuando haya repo.
