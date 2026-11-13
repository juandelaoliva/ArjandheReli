// Idiomas y textos de interfaz (botones, títulos de sección, etiquetas).
// El contenido de la boda vive en src/data/boda.ts.
// Las traducciones al albanés y al alemán deben revisarlas hablantes nativos.

export const languages = {
  sq: 'Shqip',
  en: 'English',
  de: 'Deutsch',
} as const;

export type Lang = keyof typeof languages;
export const langs = Object.keys(languages) as Lang[];
export const defaultLang: Lang = 'sq';

/** Texto traducido a los tres idiomas. */
export type L = Record<Lang, string>;

/** Locale de Intl para fechas y números. */
export const intlLocale: Record<Lang, string> = {
  sq: 'sq-AL',
  en: 'en-GB',
  de: 'de-DE',
};

const sq = {
  language: 'Gjuha',
  openInvitation: 'Hap ftesën',
  tapSeal: 'Prek vulën për ta hapur',
  skip: 'Kalo',
  scrollHint: 'Rrëshqit poshtë',
  getDirections: 'Si të vini',
  addToCalendar: 'Shto në kalendar',
  days: 'ditë',
  hours: 'orë',
  minutes: 'minuta',
  ourStory: 'Historia jonë',
  whenWhere: 'Kur dhe ku',
  ceremony: 'Ceremonia',
  rsvp: 'Konfirmo pjesëmarrjen',
  contact: 'Kontakt',
  countdownCaption: 'deri në ditën e madhe',
  ceremonyParty: 'Ceremonia dhe festa do të mbahen në të njëjtin vend.',
  time: 'Ora',
  contactIntro: 'Për çdo pyetje, na shkruani në WhatsApp.',
  rsvpBy: 'Na tregoni deri më {deadline} nëse vini.',
  storyPhoto: 'Foto e Realianës dhe Arjanit',
  withLove: 'Me respekt,',
  familiesLine: 'Familjet {a} dhe {b}',
  photoPlaceholder: '[Shtoni foton këtu]',
  musicOn: 'Çaktivizo muzikën',
  musicOff: 'Luaj muzikën',
};

type UI = { [K in keyof typeof sq]: string };

const en: UI = {
  language: 'Language',
  openInvitation: 'Open invitation',
  tapSeal: 'Tap the seal to open',
  skip: 'Skip',
  scrollHint: 'Scroll down',
  getDirections: 'Get directions',
  addToCalendar: 'Add to calendar',
  days: 'days',
  hours: 'hours',
  minutes: 'minutes',
  ourStory: 'Our story',
  whenWhere: 'When & where',
  ceremony: 'Ceremony',
  rsvp: 'Confirm attendance',
  contact: 'Contact',
  countdownCaption: 'until the big day',
  ceremonyParty: 'The ceremony and the party are at the same place.',
  time: 'Time',
  contactIntro: 'For anything at all, message us on WhatsApp.',
  rsvpBy: 'Please let us know by {deadline} if you are coming.',
  storyPhoto: 'Photo of Reliana and Arjan',
  withLove: 'With respect,',
  familiesLine: 'The {a} and {b} families',
  photoPlaceholder: '[Add photo here]',
  musicOn: 'Mute music',
  musicOff: 'Play music',
};

const de: UI = {
  language: 'Sprache',
  openInvitation: 'Einladung öffnen',
  tapSeal: 'Tippe auf das Siegel, um sie zu öffnen',
  skip: 'Überspringen',
  scrollHint: 'Nach unten scrollen',
  getDirections: 'Route anzeigen',
  addToCalendar: 'Zum Kalender hinzufügen',
  days: 'Tage',
  hours: 'Stunden',
  minutes: 'Minuten',
  ourStory: 'Unsere Geschichte',
  whenWhere: 'Wann & wo',
  ceremony: 'Trauung',
  rsvp: 'Teilnahme bestätigen',
  contact: 'Kontakt',
  countdownCaption: 'bis zum großen Tag',
  ceremonyParty: 'Trauung und Feier finden am selben Ort statt.',
  time: 'Uhrzeit',
  contactIntro: 'Bei Fragen schreib uns einfach auf WhatsApp.',
  rsvpBy: 'Bitte sag uns bis zum {deadline} Bescheid, ob du kommst.',
  storyPhoto: 'Foto von Reliana und Arjan',
  withLove: 'Mit Respekt,',
  familiesLine: 'Die Familien {a} und {b}',
  photoPlaceholder: '[Foto hier hinzufügen]',
  musicOn: 'Musik ausschalten',
  musicOff: 'Musik abspielen',
};

export const ui: Record<Lang, UI> = { sq, en, de };

export const useTranslations = (lang: Lang) => ui[lang];
