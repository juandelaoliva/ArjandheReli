// Textos del formulario de confirmación (RSVP) en albanés, inglés y alemán.
// Marcadores: {n} número, {total} total de pasos, {date} fecha, {deadline} fecha límite, {name} nombre.
// Albanés y alemán: revisar con hablantes nativos.

import type { Lang } from './ui';

export interface RsvpText {
  title: string;
  /** Debajo del título. Lleva {deadline}. */
  intro: string;
  stepOf: string; // «Paso {n} de {total}»
  back: string;
  next: string;
  toSummary: string; // botón al volver a editar desde el resumen
  edit: string;

  s1Title: string;
  nameLabel: string;
  contactLabel: string;
  attendingLabel: string;
  yes: string;
  no: string;

  s2Title: string;
  guestQuestion: string;
  guestYes: string;
  guestNo: string;
  guestNameLabel: string; // un solo invitado
  adultNameLabel: string; // {n}, varios invitados
  addGuest: string;
  removeGuest: string; // {n}

  you: string;
  companionN: string; // {n}

  summaryTitle: string;
  sumYou: string;
  sumCompanions: string;
  sumAlone: string;
  submitYes: string;
  submitNo: string;
  sending: string;

  errName: string;
  errContact: string;
  errContactInvalid: string;
  errAttending: string;
  errGuest: string;
  errAdultName: string; // {n}
  sendError: string;

  doneYes: string; // {date}
  doneNo: string;
  alreadyYes: string; // {date}
  alreadyNo: string; // {date}
  changeReply: string;
  retry: string;
}

const sq: RsvpText = {
  title: 'Konfirmo pjesëmarrjen',
  intro: 'Ju lutemi, konfirmoni pjesëmarrjen tuaj para datës {deadline}.',
  stepOf: 'Hapi {n} nga {total}',
  back: 'Prapa',
  next: 'Vazhdo',
  toSummary: 'Shiko përmbledhjen',
  edit: 'Ndrysho',

  s1Title: 'Ju',
  nameLabel: 'Emri dhe mbiemri',
  contactLabel: 'Telefoni',
  attendingLabel: 'A do të vini?',
  yes: 'Po, do të jem aty',
  no: 'Nuk mund të vij',

  s2Title: 'Kush vjen me ju',
  guestQuestion: 'A sillni një të ftuar me ju?',
  guestYes: 'Po',
  guestNo: 'Jo',
  guestNameLabel: 'Emri i të ftuarit',
  adultNameLabel: 'Emri i të ftuarit {n}',
  addGuest: 'shto një të ftuar tjetër',
  removeGuest: 'Hiq të ftuarin {n}',

  you: 'Ju',
  companionN: 'Shoqëruesi {n}',

  summaryTitle: 'Kontrolloni përgjigjen',
  sumYou: 'Ju',
  sumCompanions: 'Shoqëruesit',
  sumAlone: 'Vini vetëm',
  submitYes: 'Konfirmo pjesëmarrjen',
  submitNo: 'Dërgo përgjigjen',
  sending: 'Po dërgohet…',

  errName: 'Shkruani emrin tuaj për të vazhduar',
  errContact: 'Shkruani numrin e telefonit për të vazhduar',
  errContactInvalid: 'Kontrolloni numrin e telefonit: nuk duket i saktë',
  errAttending: 'Zgjidhni nëse do të vini',
  errGuest: 'Zgjidhni nëse sillni një të ftuar',
  errAdultName: 'Shkruani emrin e të ftuarit {n}',
  sendError: 'Nuk u dërgua. Kontrolloni lidhjen dhe provoni përsëri.',

  doneYes: 'Pjesëmarrja u konfirmua. Shihemi më {date}!',
  doneNo: 'Përgjigjja u dërgua. Do të na mungoni.',
  alreadyYes: 'Keni konfirmuar më {date}.',
  alreadyNo: 'Keni përgjigjur më {date}.',
  changeReply: 'Ndrysho përgjigjen time',
  retry: 'Provo përsëri',
};

const en: RsvpText = {
  title: 'Confirm attendance',
  intro: 'Kindly confirm your attendance before {deadline}.',
  stepOf: 'Step {n} of {total}',
  back: 'Back',
  next: 'Continue',
  toSummary: 'Back to summary',
  edit: 'Edit',

  s1Title: 'You',
  nameLabel: 'Full name',
  contactLabel: 'Phone',
  attendingLabel: 'Will you be there?',
  yes: 'Yes, I’ll be there',
  no: 'I can’t make it',

  s2Title: 'Who’s coming with you',
  guestQuestion: 'Are you bringing a guest?',
  guestYes: 'Yes',
  guestNo: 'No',
  guestNameLabel: 'Guest’s name',
  adultNameLabel: 'Guest {n}’s name',
  addGuest: 'add another guest',
  removeGuest: 'Remove guest {n}',

  you: 'You',
  companionN: 'Guest {n}',

  summaryTitle: 'Check your reply',
  sumYou: 'You',
  sumCompanions: 'Guests',
  sumAlone: 'Coming on your own',
  submitYes: 'Confirm attendance',
  submitNo: 'Send reply',
  sending: 'Sending…',

  errName: 'Enter your name to continue',
  errContact: 'Enter your phone number to continue',
  errContactInvalid: 'Check your phone number: it doesn’t look right',
  errAttending: 'Choose whether you’ll be there',
  errGuest: 'Choose whether you’re bringing a guest',
  errAdultName: 'Enter guest {n}’s name',
  sendError: 'Couldn’t send. Check your connection and try again.',

  doneYes: 'Attendance confirmed. See you on {date}!',
  doneNo: 'Reply sent. We’ll miss you.',
  alreadyYes: 'You already confirmed on {date}.',
  alreadyNo: 'You already replied on {date}.',
  changeReply: 'Change my reply',
  retry: 'Try again',
};

const de: RsvpText = {
  title: 'Teilnahme bestätigen',
  intro: 'Bitte bestätige deine Teilnahme vor dem {deadline}.',
  stepOf: 'Schritt {n} von {total}',
  back: 'Zurück',
  next: 'Weiter',
  toSummary: 'Zur Übersicht',
  edit: 'Ändern',

  s1Title: 'Du',
  nameLabel: 'Vor- und Nachname',
  contactLabel: 'Telefon',
  attendingLabel: 'Bist du dabei?',
  yes: 'Ja, ich komme',
  no: 'Ich kann leider nicht kommen',

  s2Title: 'Wer kommt mit dir?',
  guestQuestion: 'Bringst du eine Begleitung mit?',
  guestYes: 'Ja',
  guestNo: 'Nein',
  guestNameLabel: 'Name der Begleitung',
  adultNameLabel: 'Name der Begleitung {n}',
  addGuest: 'weitere Begleitung hinzufügen',
  removeGuest: 'Begleitung {n} entfernen',

  you: 'Du',
  companionN: 'Begleitung {n}',

  summaryTitle: 'Antwort prüfen',
  sumYou: 'Du',
  sumCompanions: 'Begleitung',
  sumAlone: 'Du kommst allein',
  submitYes: 'Teilnahme bestätigen',
  submitNo: 'Antwort senden',
  sending: 'Wird gesendet…',

  errName: 'Trag deinen Namen ein, um fortzufahren',
  errContact: 'Trag deine Telefonnummer ein, um fortzufahren',
  errContactInvalid: 'Prüfe deine Telefonnummer: Das sieht nicht richtig aus',
  errAttending: 'Wähle, ob du dabei bist',
  errGuest: 'Wähle, ob du eine Begleitung mitbringst',
  errAdultName: 'Trag den Namen der Begleitung {n} ein',
  sendError: 'Senden fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.',

  doneYes: 'Teilnahme bestätigt. Wir sehen uns am {date}!',
  doneNo: 'Antwort gesendet. Wir werden dich vermissen.',
  alreadyYes: 'Du hast am {date} zugesagt.',
  alreadyNo: 'Du hast am {date} geantwortet.',
  changeReply: 'Antwort ändern',
  retry: 'Erneut versuchen',
};

export const rsvpText: Record<Lang, RsvpText> = { sq, en, de };
