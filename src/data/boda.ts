// TODO el contenido de la boda en un único archivo.
// Lo marcado con [corchetes] o PLACEHOLDER es provisional y hay que sustituirlo.
// Textos traducibles: objetos { sq, en, de }. Albanés y alemán: revisar con nativos.

import type { L } from '../i18n/ui';

export const boda = {
  novios: { ella: 'Reliana', el: 'Arjan', apellidoElla: 'Shehaj', apellidoEl: 'Hoxha' },
  /** «y» entre los nombres en el estilo de invitación clásica. */
  y: { sq: 'dhe', en: 'and', de: 'und' } satisfies L,
  /** Textos del estilo «relieve clásico» (invitación impresa en relieve). */
  relieve: {
    familias: { sq: 'Së bashku me familjet e tyre', en: 'Together with our families', de: 'Gemeinsam mit unseren Familien' } satisfies L,
    peticion: {
      sq: 'kanë kënaqësinë e madhe t’ju ftojnë të festoni dasmën e tyre',
      en: 'we have the great pleasure of inviting you to celebrate our wedding',
      de: 'haben wir die große Freude, dich zur Feier unserer Hochzeit einzuladen',
    } satisfies L,
  },

  /** Hora de inicio (ceremonia) con el desfase de Tirana en verano (CEST, +02:00). */
  fecha: '2027-07-09T19:00:00+02:00', // la boda empieza a las 19:00 (hora de Tirana)
  zonaHoraria: 'Europe/Tirane',
  ciudad: { sq: 'Tiranë', en: 'Tirana', de: 'Tirana' } satisfies L,
  pais: { sq: 'Shqipëri', en: 'Albania', de: 'Albanien' } satisfies L,

  /** Texto de invitación sobre los nombres, en la portada. */
  invitacion: {
    sq: 'Kemi gëzimin t’ju ftojmë në dasmën tonë',
    en: 'We joyfully invite you to our wedding',
    de: 'Wir laden dich herzlich zu unserer Hochzeit ein',
  } satisfies L,

  frase: {
    sq: 'Martohemi dhe duam ta festojmë me ju.',
    en: 'We’re getting married and we’d love to celebrate with you.',
    de: 'Wir heiraten und möchten mit dir feiern.',
  } satisfies L,

  /** Fecha límite para confirmar asistencia. */
  fechaLimite: '2027-05-01', // hay que responder antes del 1 de mayo de 2027

  /** Ceremonia (no religiosa) y fiesta en el mismo sitio. */
  lugar: {
    nombre: 'La Gert Grand Palace',
    hora: '19:00',
    /** Cómo llegar: sin «origin», Google Maps traza la ruta desde la ubicación actual de quien pulsa. */
    mapa: 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + encodeURIComponent('La Gert Grand Palace, Tirana, Albania'),
    /** Ficha del sitio en Google (referencia; no se usa en la web). */
    ficha: 'https://share.google/kcyE3OqAaxriTkpHI',
  },






  contacto: [
    { nombre: 'Arjan', telefono: '+355 67 602 7015', whatsapp: 'https://wa.me/355676027015' },
    { nombre: 'Reliana', telefono: '+49 1575 0881183', whatsapp: 'https://wa.me/4915750881183' },
  ],

  historia: {
    activa: true,
  },

  /** Canción que empieza a sonar al abrir el sobre (public/audio/cancion.mp3, comprimida desde originales/audio/). */
  musica: {
    activa: true,
    archivo: 'audio/cancion.mp3',
    volumen: 0.55,
  },
} as const;
