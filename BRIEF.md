# Invitación de boda: brief del proyecto

> Todo el contenido de este documento es **placeholder**: nombres, fechas, lugares, textos, teléfonos y cuentas son ficticios.
> Está pensado como especificación para Claude Code: colócalo en la raíz del repo y referéncialo desde `CLAUDE.md`.

---

## 1. Resumen

Web one-pager, mobile first, que funciona como invitación de boda digital. Tres piezas:

1. **Intro:** un sobre cerrado que se abre al tocar el sello. La tarjeta sale del sobre y se transforma en la portada de la web.
2. **Información:** cuándo y dónde, programa, transporte, alojamiento, dress code, regalo y preguntas frecuentes.
3. **Confirmación de asistencia:** formulario multipaso con diseño propio que guarda las respuestas en Google Sheets.

La invitación es **genérica** (el mismo enlace para todos). La versión personalizada por invitado queda como decisión abierta (ver §10).

---

## 2. Stack y despliegue

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | Astro, salida estática | Una sola página, sin JS innecesario, un componente por sección |
| Animación | GSAP (core + Flip + ScrollTrigger) | Timelines precisas y fluidas en móvil |
| Estilos | CSS propio con custom properties | Control total del diseño, sin framework |
| Formulario | HTML + TypeScript propio | Mantiene el diseño al 100 % |
| Backend | Google Apps Script (aplicación web) | Gratis y escribe directamente en Sheets |
| Datos | Google Sheets | Se comparte, filtra y exporta a Excel |
| Hosting | GitHub Pages + GitHub Actions | Gratis, despliegue en cada push |

### Notas sobre GitHub Pages

- Sin dominio propio, la URL será `usuario.github.io/nombre-repo`. Hay que configurar `site` y `base` en `astro.config.mjs` y construir todas las rutas (imágenes, fuentes, audio, `.ics`) con `import.meta.env.BASE_URL`.
- Si más adelante hay dominio: añadir `public/CNAME`, cambiar `base` a `'/'` y configurar el DNS.
- Con una cuenta gratuita de GitHub, Pages exige repo público: el contenido de la boda y la URL del Apps Script serán visibles en el código. Es aceptable para una boda, pero conviene saberlo.
- Despliegue con el workflow oficial de Astro para GitHub Pages (`withastro/action` + `actions/deploy-pages`).
- Para probar en el móvil durante el desarrollo: `astro dev --host` y abrir la IP local desde el teléfono.

---

## 3. Contenido (placeholders)

Todo este contenido vive en **un único archivo**, `src/data/boda.ts`, para poder sustituir los placeholders sin tocar los componentes.

### Datos generales

- **Novios:** Lucía & Martín
- **Fecha:** sábado, 18 de septiembre de 2027
- **Frase de portada:** «Nos casamos y queremos celebrarlo contigo.»
- **Fecha límite para confirmar:** 1 de agosto de 2027

### Ceremonia

- **Lugar:** Ermita de San Isidro
- **Dirección:** Camino de la Ermita, s/n. 00000 Villanueva del Río (Provincia)
- **Hora:** 12:30
- **Mapa:** `https://maps.google.com/?q=PLACEHOLDER_CEREMONIA`

### Celebración

- **Lugar:** Finca Los Almendros
- **Dirección:** Carretera CV-000, km 4. 00000 Villanueva del Río (Provincia)
- **Hora:** desde las 13:30
- **Mapa:** `https://maps.google.com/?q=PLACEHOLDER_FINCA`

### Programa del día

| Hora | Momento |
|---|---|
| 12:00 | Llegada de invitados |
| 12:30 | Ceremonia |
| 13:30 | Cóctel en los jardines |
| 15:30 | Banquete |
| 18:30 | Baile y fiesta |
| 02:30 | Fin de fiesta |

### Transporte

- **Autobús de ida:** sale a las 11:30 de la Plaza de España (Ciudad), con parada en la estación de tren a las 11:40.
- **Autobuses de vuelta:** 20:00 y 02:45, hasta la Plaza de España.
- Las plazas se reservan en el formulario.
- La finca tiene aparcamiento gratuito.

### Alojamiento

- **Hotel El Mirador:** a 5 minutos de la finca. Código `BODALM` para tarifa especial hasta el 1 de julio de 2027. Teléfono +34 600 000 001.
- **Casa rural La Higuera:** a 10 minutos de la finca. Teléfono +34 600 000 002.

### Dress code

Formal. La fiesta es en jardín: mejor tacón ancho que de aguja. El blanco, para la novia.

### Regalo

- **Texto:** «Lo más importante es que vengas. Si además quieres hacernos un regalo, este es nuestro número de cuenta.»
- **Titulares:** Lucía Pérez Ruiz y Martín García López
- **IBAN:** `ES00 0000 0000 0000 0000 0000`
- Botón **«Copiar IBAN»**, que cambia a **«IBAN copiado»** al pulsarlo.

### Preguntas frecuentes

- **¿Puedo ir con acompañante?** Si tu invitación incluye acompañante, añádelo en el formulario.
- **¿Pueden venir niños?** Sí. Habrá menú infantil y zona de juegos. Indica cuántos vienen en el formulario.
- **¿Tenéis en cuenta alergias y dietas?** Sí. Indícalas en el formulario para cada persona.
- **¿Hasta cuándo puedo confirmar?** Hasta el 1 de agosto de 2027.
- **¿Y si cambio de planes después de confirmar?** Escríbenos por WhatsApp.

### Contacto

- **Lucía:** +34 600 000 003 → `https://wa.me/34600000003`
- **Martín:** +34 600 000 004 → `https://wa.me/34600000004`

### Nuestra historia (opcional)

Un párrafo breve y una foto. Placeholder: «Nos conocimos en 2019 en una boda, así que esto tiene algo de círculo que se cierra. Ocho años, dos mudanzas y un perro después, nos casamos.»

### Música (opcional)

Una canción en bucle que empieza al tocar el sello, con un botón de silencio siempre visible. Se activa o desactiva desde `boda.ts`.

---

## 4. Estructura de la página

1. **Intro:** el sobre, a pantalla completa y con el scroll bloqueado.
2. **Portada:** la tarjeta con nombres, fecha y frase.
3. **Cuenta atrás:** días, horas y minutos.
4. **Nuestra historia** (opcional).
5. **Cuándo y dónde:** ceremonia y celebración, con botones «Cómo llegar» y «Añadir al calendario».
6. **Programa del día.**
7. **Transporte.**
8. **Alojamiento.**
9. **Dress code.**
10. **Regalo.**
11. **Confirmar asistencia:** el formulario.
12. **Preguntas frecuentes.**
13. **Contacto y pie.**

Un botón flotante **«Confirmar asistencia»** aparece después de la portada y lleva al formulario. Se oculta cuando el formulario está en pantalla y cuando ya se ha confirmado.

«Añadir al calendario» ofrece un archivo `public/boda.ics` estático y un enlace a Google Calendar.

---

## 5. Intro: el sobre

Es el momento memorable de la web. Todo lo demás es sobrio para que este destaque.

### Formato

En móvil el sobre es **vertical** (proporción aproximada 0,7), se abre por el lado corto superior y contiene una tarjeta también vertical. Así ocupa bien la pantalla del teléfono y la tarjeta ya tiene la forma de la portada en la que se convierte. En escritorio se mantiene igual, centrado.

### Capas (de atrás hacia delante)

1. `envelope-back`: cuerpo trasero del sobre.
2. `envelope-liner`: forro interior estampado, visible al abrir la solapa.
3. `card`: la tarjeta. Contiene ya el marcado de la portada, para que la transición sea continua.
4. `envelope-pocket`: bolsillo delantero, con los pliegues laterales e inferior.
5. `envelope-flap`: solapa superior con dos caras (exterior de papel del sobre, interior con el forro) y `backface-visibility: hidden`.
6. `seal`: lacre sobre el vértice de la solapa. Es un `<button>` con etiqueta accesible «Abrir invitación».

Contenedor con `perspective: 1200px`.

### Secuencia (timeline de GSAP)

| # | Paso | Duración | Ease |
|---|---|---|---|
| 0 | Reposo: el sobre flota suavemente (±4 px) y bajo él se lee «Toca el sello para abrir» | bucle | `sine.inOut` |
| 1 | Al tocar, el lacre se hunde, se parte en dos y las mitades caen y se desvanecen | 0,5 s | `power2.in` |
| 2 | La solapa gira de `rotateX(0)` a `rotateX(180deg)` con `transform-origin: top` | 0,8 s | `power2.inOut` |
| – | Al pasar los 90°, la solapa baja de `z-index` para quedar detrás de la tarjeta | instantáneo | – |
| 3 | La tarjeta sube hasta asomar un 40–50 % y se leen los nombres | 0,9 s | `power3.out` |
| 4 | Pausa | 0,3 s | – |
| 5 | El sobre cae y se desvanece mientras la tarjeta crece hasta ocupar la pantalla (Flip); el redondeo y la sombra desaparecen | 1,2 s | `expo.inOut` |
| 6 | La tarjeta ya es la portada: se desbloquea el scroll y aparece una indicación discreta para deslizar | 0,4 s | `power1.out` |

Unos 4 segundos desde el toque.

### Reglas técnicas

- Animar solo `transform` y `opacity`. Nunca `box-shadow`, `filter`, `width` ni `height` (Flip ya trabaja con transforms). Las sombras se simulan con una capa propia cuya opacidad sí se anima.
- `will-change: transform` solo mientras dura la intro; quitarlo al terminar.
- Scroll bloqueado durante la intro y `overscroll-behavior: none`.
- `prefers-reduced-motion: reduce`: sin 3D; la portada aparece con un fundido de 0,4 s.
- Segunda visita: si `localStorage` tiene `intro-vista`, mostrar un enlace «Saltar» desde el inicio.
- La música, si existe, empieza en el paso 1: los navegadores solo permiten audio tras una interacción.
- Texturas en AVIF/WebP de menos de 80 KB cada una; forro como patrón SVG; lacre en SVG.
- Probar en un Android de gama media real y en Safari de iOS, no solo en el simulador.

### Después de la intro

La transición tarjeta → portada es la animación fluida que conecta con el resto de la página. A partir de ahí, las secciones **no** entran con efectos repetidos (nada de fundido y desplazamiento en cada bloque). ScrollTrigger se reserva para un detalle con sentido: la línea del programa del día se dibuja a medida que se hace scroll, porque representa el paso del tiempo.

---

## 6. Formulario de confirmación

### Pasos

Es una secuencia real, así que lleva indicador «Paso 2 de 5» y barra de progreso.

**Paso 1: Tú**
- Nombre y apellidos (obligatorio).
- Teléfono o email (obligatorio uno de los dos).
- ¿Vienes? → «Sí, allí estaré» / «No podré ir».
- Si elige «No podré ir», salta directamente al paso 5 y desde ahí se envía.

**Paso 2: Quién viene contigo**
- Adultos además de ti: selector de 0 a 4, con el nombre de cada uno.
- Niños: selector de 0 a 4, con nombre y edad de cada uno (para menú infantil y tronas).

**Paso 3: Comida**
- Para cada persona del grupo: menú (General / Vegetariano / Vegano / Infantil) y alergias o intolerancias en texto libre.

**Paso 4: Transporte**
- Autobús de ida: sí / no.
- Autobús de vuelta: no / 20:00 / 02:45.
- Plazas: por defecto, el tamaño del grupo; editable.

**Paso 5: Para terminar**
- Canción que no puede faltar (opcional).
- Mensaje para los novios (opcional).

**Resumen**
- Todas las respuestas para revisarlas, con enlace «Editar» en cada bloque, y botón **«Confirmar asistencia»** (o **«Enviar respuesta»** si no viene).

**Confirmación**
- La tarjeta del formulario se pliega, entra en un sobre y se sella con lacre: el mismo gesto de la intro, al revés.
- Si viene: «Asistencia confirmada. ¡Nos vemos el 18 de septiembre!»
- Si no viene: «Respuesta enviada. Te echaremos de menos.»

### Comportamiento

- Botón «Atrás» siempre disponible; transición horizontal corta entre pasos (0,35 s), sustituida por un fundido con reduced motion.
- Validación al avanzar, con mensajes concretos: «Escribe tu nombre para continuar».
- El progreso se guarda en `localStorage` y se borra al enviar con éxito.
- Tras enviar, se guarda `rsvp-enviado` y la sección muestra: «Ya confirmaste el {fecha}. Si necesitas cambiar algo, escríbenos por WhatsApp.»
- Campo trampa oculto `website` (honeypot) contra spam.
- Cada envío lleva un `id` generado con `crypto.randomUUID()` para detectar duplicados.
- Error de envío: «No se ha podido enviar. Revisa tu conexión y vuelve a intentarlo.» Los datos se conservan.
- Accesibilidad: etiquetas visibles, objetivos táctiles de al menos 44 px, foco visible, `aria-live` para cambios de paso y errores.
- Teclado móvil adecuado: `autocomplete="name"`, `inputmode="tel"`, `type="email"`.

### Hoja de Google Sheets

Pestaña **Respuestas**, una fila por envío:

`fecha_envio | id | nombre | contacto | asiste | adultos_extra | nombres_adultos | ninos | nombres_edades_ninos | menus | alergias | bus_ida | bus_vuelta | plazas_bus | cancion | mensaje`

Las columnas con varias personas (`menus`, `alergias`) se guardan como texto legible: `Lucía: vegetariano; Pablo (6): infantil`.

Pestaña **Resumen** con fórmulas: total de asistentes, adultos, niños, recuento por menú, lista de alergias y plazas de autobús de ida y de cada vuelta.

### Backend: Google Apps Script

1. Crear la hoja → Extensiones → Apps Script.
2. Función `doPost(e)`:
   - Parsear el JSON de `e.postData.contents`.
   - Descartar el envío si el honeypot viene relleno o faltan campos obligatorios.
   - Usar `LockService.getScriptLock()` para evitar escrituras simultáneas.
   - `appendRow` con las columnas en el orden de arriba.
   - Opcional: `MailApp.sendEmail` a los novios con el resumen de cada confirmación.
   - Responder `{ ok: true }` con `ContentService` y tipo MIME JSON.
3. Implementar como aplicación web: ejecutar como «Yo», acceso «Cualquier usuario».
4. Guardar la URL en la variable `PUBLIC_RSVP_ENDPOINT` (en GitHub Actions, como variable del repositorio pasada al paso de build).
5. Versionar el script en `apps-script/Code.gs` (se copia al editor a mano o con `clasp`).

En el frontend: `fetch(endpoint, { method: 'POST', body: JSON.stringify(datos) })` **sin** cabecera `Content-Type: application/json`. Así se envía como `text/plain`, no hay petición preflight de CORS y Apps Script (que no responde a `OPTIONS`) lo acepta.

---

## 7. Dirección visual (propuesta a validar)

**Concepto: correspondencia.** La web es una carta y todo sale del mundo de la papelería real: papel de algodón, sobre azul de correo con forro estampado, lacre y tinta azul en lugar de negro.

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--algodon` | `#FAFAF7` | Fondo y tarjeta |
| `--tinta` | `#1E2B45` | Texto (azul noche, no negro) |
| `--sobre` | `#3A5A80` | Sobre y botón principal |
| `--forro` | `#D4A93C` | Forro interior y detalles puntuales |
| `--lacre` | `#7A2E3A` | Sello y opción seleccionada en el formulario |
| `--niebla` | `#DCE3EA` | Bordes de campos y fondos de sección alternos |

Tema claro fijo (`color-scheme: light`): es papel.

### Tipografía

- **Bodoni Moda** para nombres, fecha y títulos, en tamaños grandes que aprovechen su contraste. Es la letra de la papelería grabada clásica.
- **Jost** para texto, formulario y botones: geométrica, muy legible en pantallas pequeñas y claramente distinta de Bodoni.
- Autoalojadas con Fontsource. Precargar solo los pesos que usa la portada.
- Escala: base de 17 px en móvil, ratio 1,333. Interlineado del texto, 1,6.

### Maquetación

- Columna única de máximo 34 rem (unos 60 caracteres por línea).
- Portada y títulos de sección centrados, como en una invitación impresa. Texto, programa, preguntas frecuentes y formulario alineados a la izquierda para leer con comodidad.
- Las secciones se separan con espacio, no con tarjetas ni líneas.

### Principios

- Un solo momento llamativo: el sobre. El resto, sobrio.
- Sin etiquetas en mayúsculas ni rótulos pequeños sobre cada título.
- Numeración solo donde hay secuencia: programa del día y pasos del formulario.
- Textos claros y en voz activa; cada botón dice lo que hace: «Confirmar asistencia», «Copiar IBAN», «Cómo llegar».

---

## 8. Detalles que marcan la diferencia

- **Imagen Open Graph** (1200 × 630) con el sobre cerrado: es lo que se ve al compartir el enlace por WhatsApp. Título y descripción OG cuidados.
- `<meta name="robots" content="noindex">` para que no aparezca en buscadores.
- Favicon con el lacre.
- `theme-color` del navegador: color del sobre durante la intro y del papel después.
- Rendimiento: LCP por debajo de 2,5 s en 4G, imágenes AVIF/WebP con `srcset`, GSAP cargado solo en cliente.

---

## 9. Estructura del repo

```
/
├── BRIEF.md
├── CLAUDE.md
├── astro.config.mjs
├── .github/workflows/deploy.yml
├── apps-script/
│   └── Code.gs
├── public/
│   ├── boda.ics
│   ├── og.jpg
│   └── audio/            (opcional)
└── src/
    ├── data/boda.ts      ← todo el contenido
    ├── styles/
    │   ├── tokens.css
    │   └── global.css
    ├── scripts/
    │   └── intro.ts      ← timeline del sobre
    ├── components/
    │   ├── Envelope.astro
    │   ├── Hero.astro
    │   ├── Countdown.astro
    │   ├── Story.astro
    │   ├── Venues.astro
    │   ├── Schedule.astro
    │   ├── Transport.astro
    │   ├── Stay.astro
    │   ├── DressCode.astro
    │   ├── Gift.astro
    │   ├── Faq.astro
    │   ├── Contact.astro
    │   └── rsvp/
    │       ├── RsvpForm.astro
    │       └── rsvp.ts
    └── pages/index.astro
```

---

## 10. Decisiones abiertas

- **Genérica o personalizada.** La genérica no puede limitar acompañantes; se confía en el texto de la FAQ. La personalizada (un enlace por familia con plazas asignadas) cambiaría el formulario y el modelo de datos.
- **Dominio propio** y, con él, el `base` de Astro.
- **Música:** sí o no.
- **Idiomas:** uno o varios.
- **Nuestra historia y fotos:** incluir o no.
- **Dirección visual definitiva:** la de §7 es una propuesta.

---

## 11. Plan de trabajo con Claude Code

1. Proyecto Astro y despliegue en GitHub Pages funcionando con una página vacía (validar el `base`).
2. Tokens de diseño y `boda.ts` con los placeholders.
3. **Prototipo aislado del sobre**, iterando en un móvil real hasta que se sienta bien. Es lo más arriesgado, por eso va primero.
4. Secciones informativas con el contenido placeholder.
5. Formulario multipaso con envío simulado.
6. Hoja, Apps Script y conexión real; probar envíos correctos, errores y spam.
7. Pulido: Open Graph, favicon, `.ics`, rendimiento, accesibilidad, reduced motion y pruebas en iOS Safari y Android Chrome.
8. Sustituir los placeholders por el contenido real.
