import { intlLocale, type Lang } from './ui';
import { boda } from '../data/boda';

/** Formatea una fecha ISO en el idioma indicado y en la hora de Tirana. */
export function formatDate(
  iso: string,
  lang: Lang,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  return new Intl.DateTimeFormat(intlLocale[lang], {
    timeZone: boda.zonaHoraria,
    ...options,
  }).format(new Date(iso));
}

/** Fecha larga de la boda: «e premte, 9 korrik 2027», «Friday 9 July 2027»… */
export const weddingDate = (lang: Lang) =>
  formatDate(boda.fecha, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Sustituye {deadline} y similares en los textos de boda.ts. */
export function fill(text: string, lang: Lang): string {
  return text.replaceAll('{deadline}', formatDate(boda.fechaLimite, lang));
}

/** Partes de la fecha de la boda para la portada: día de la semana, día, mes, año y hora. */
export function dateParts(lang: Lang) {
  const f = (o: Intl.DateTimeFormatOptions) => formatDate(boda.fecha, lang, o);
  return {
    weekday: f({ weekday: 'long' }),
    day: f({ day: 'numeric' }),
    month: f({ month: 'long' }),
    year: f({ year: 'numeric' }),
    time: boda.lugar.hora,
  };
}
