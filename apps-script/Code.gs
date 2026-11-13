/**
 * Backend del formulario de confirmación: Google Apps Script como aplicación web.
 *
 * Instalación:
 *  1. Crea una hoja de Google → Extensiones → Apps Script y pega este archivo.
 *  2. Implementar → Nueva implementación → Aplicación web:
 *       Ejecutar como: «Yo»  ·  Quién tiene acceso: «Cualquier usuario».
 *  3. Copia la URL de la implementación en la variable PUBLIC_RSVP_ENDPOINT.
 *
 * Si cambias este archivo: Implementar → Administrar implementaciones → editar (lápiz)
 * → Versión: «Nueva versión» → Implementar. Guardar sin más NO actualiza la aplicación web.
 *
 * El frontend envía un POST con el JSON como texto plano (sin Content-Type: application/json)
 * para evitar la petición preflight de CORS, que Apps Script no sabe responder.
 *
 * Hoja en inglés. Pestaña «Responses», una fila por persona que responde:
 *   phone | name | attending | guests | guest_names | total_people | language | submitted_at | id
 * Si alguien vuelve a responder con el mismo teléfono (aunque lo escriba distinto: «+355 69…» o «069…»),
 * se sustituye su fila en lugar de añadir otra.
 */

const SHEET_NAME = 'Responses';
// Correo (o varios separados por comas) que recibe un aviso por cada respuesta. Vacío = sin avisos.
const NOTIFY_EMAIL = '';

const HEADERS = [
  'phone', 'name', 'attending', 'guests', 'guest_names', 'total_people', 'language', 'submitted_at', 'id',
];
const COL_PHONE = HEADERS.indexOf('phone') + 1;
const COL_ID = HEADERS.indexOf('id') + 1;
const MAX_GUESTS = 4;

function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }

  // Honeypot: si viene relleno es un bot. Se responde «ok» para que no insista.
  if (clean_(data.website)) return json_({ ok: true });

  const id = clean_(data.id, 64);
  const name = clean_(data.nombre, 120);
  // «contacto» es el nombre del campo en versiones anteriores del formulario.
  const phone = clean_(data.telefono || data.contacto, 40);
  const raw = clean_(data.asiste, 3).toLowerCase();
  const attending = raw === 'si' || raw === 'yes' ? 'Yes' : raw === 'no' ? 'No' : '';
  if (!id || !name || !phone || !attending) {
    return json_({ ok: false, error: 'missing_fields' });
  }

  const yes = attending === 'Yes';
  const guests = yes ? Math.max(0, Math.min(MAX_GUESTS, parseInt(data.invitados, 10) || 0)) : 0;
  const row = [
    phone,
    name,
    attending,
    guests,
    yes ? clean_(data.nombres_invitados, 500) : '',
    yes ? 1 + guests : 0,
    clean_(data.idioma, 5),
    new Date(),
    id,
  ];

  let updated = false;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    if (last > 1) {
      // Mismo id = reintento del mismo envío: no se duplica la fila.
      const dup = sheet.getRange(2, COL_ID, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
      if (dup) return json_({ ok: true, duplicate: true });

      // Mismo teléfono = la persona corrige su respuesta: se sustituye su fila.
      const key = phoneKey_(phone);
      const phones = sheet.getRange(2, COL_PHONE, last - 1, 1).getDisplayValues();
      for (let i = 0; i < phones.length; i++) {
        if (key && phoneKey_(phones[i][0]) === key) {
          sheet.getRange(i + 2, 1, 1, HEADERS.length).setValues([row]);
          updated = true;
          break;
        }
      }
    }
    if (!updated) sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) notify_(row, updated);
  return json_({ ok: true, updated: updated });
}

/** Comprobación rápida abriendo la URL en el navegador. */
function doGet() {
  return json_({ ok: true, service: 'rsvp' });
}

/** Pestaña «Responses» con su fila de cabeceras (se crea o se repara si falta o es de una versión anterior). */
function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  const first = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0].join('|')
    : '';
  if (first !== HEADERS.join('|')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Clave para comparar teléfonos: los últimos 9 dígitos («+355 69 123 4567» y «069 123 4567» coinciden). */
function phoneKey_(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 7 ? digits.slice(-9) : '';
}

/** Texto recortado y sin fórmulas: evita que «=…» o «+…» se ejecuten en la hoja. */
function clean_(value, max) {
  let s = String(value == null ? '' : value).trim();
  if (max) s = s.slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function notify_(row, updated) {
  try {
    const [phone, name, attending, guests, guestNames, total, language] = row;
    const comes = attending === 'Yes';
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: (updated ? 'Updated reply: ' : comes ? 'RSVP confirmed: ' : 'Cannot attend: ') + name,
      body: [
        'Name: ' + name,
        'Phone: ' + String(phone).replace(/^'/, ''),
        'Language: ' + language,
        'Attending: ' + attending,
        comes ? 'Guests: ' + guests + (guestNames ? ' (' + guestNames + ')' : '') : '',
        comes ? 'Total people: ' + total : '',
      ].filter(Boolean).join('\n'),
    });
  } catch (err) {
    // Un fallo de correo no debe impedir guardar la respuesta.
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
