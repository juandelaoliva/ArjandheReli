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
 *   phone | name | attending | guests | guest_names | total_people | language | submitted_at | id | note | edit_key | times_sent
 *
 * Una fila por teléfono. El mismo número escrito de formas distintas («+355 69 123 4567», «069 123 4567»,
 * «00355 69 123 4567») se reconoce como el mismo y actualiza su fila: «times_sent» cuenta los envíos y «note»
 * guarda el historial (fecha y respuesta anterior), indicando si el reenvío llegó desde otro dispositivo.
 *
 * Seguridad:
 *  - Cada dispositivo envía una clave secreta (se guarda solo su hash SHA-256 en «edit_key»). Un reenvío desde otro
 *    dispositivo se marca en la nota con la respuesta anterior, para poder detectar y deshacer una suplantación.
 *  - Límite de envíos por minuto, trampa para bots (honeypot) y validación de todos los campos.
 *  - Los textos que empiezan por = + - @ se guardan como texto (nadie puede colar fórmulas en la hoja).
 *  - La aplicación web no permite leer la hoja: solo añadir o actualizar respuestas.
 */

const SHEET_NAME = 'Responses';
// Correo (o varios separados por comas) que recibe un aviso por cada respuesta. Vacío = sin avisos.
const NOTIFY_EMAIL = '';

const HEADERS = [
  'phone', 'name', 'attending', 'guests', 'guest_names', 'total_people', 'language', 'submitted_at', 'id', 'note', 'edit_key',
  'times_sent',
];
const COL = {};
HEADERS.forEach(function (h, i) { COL[h] = i; });
const COL_PHONE = HEADERS.indexOf('phone') + 1;
const COL_ID = HEADERS.indexOf('id') + 1;
const LANGS = ['sq', 'en', 'de'];
// Envíos aceptados por minuto entre todos los invitados (de sobra para una boda; frena a los bots).
const MAX_PER_MINUTE = 30;
const MAX_GUESTS = 4;

function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }

  // Honeypot: si viene relleno es un bot. Se responde «ok» para que no insista.
  if (!data || typeof data !== 'object' || clean_(data.website)) return json_({ ok: true });
  if (!underRateLimit_()) return json_({ ok: false, error: 'busy' });

  const id = clean_(data.id, 64);
  const name = clean_(data.nombre, 120);
  // «contacto» es el nombre del campo en versiones anteriores del formulario.
  const phone = clean_(data.telefono || data.contacto, 40);
  const raw = clean_(data.asiste, 3).toLowerCase();
  const attending = raw === 'si' || raw === 'yes' ? 'Yes' : raw === 'no' ? 'No' : '';
  if (!id || name.length < 2 || !phone || !attending) {
    return json_({ ok: false, error: 'missing_fields' });
  }
  if (!phoneKey_(phone) || !/^'?[+()\d\s.\-]+$/.test(phone)) return json_({ ok: false, error: 'bad_phone' });
  // Clave secreta del dispositivo (solo se guarda su hash).
  const key = clean_(data.clave, 80);
  const keyHash = key.length >= 16 ? sha256_(key) : '';

  const yes = attending === 'Yes';
  const guests = yes ? Math.max(0, Math.min(MAX_GUESTS, parseInt(data.invitados, 10) || 0)) : 0;
  const row = [
    phone,
    name,
    attending,
    guests,
    yes ? clean_(data.nombres_invitados, 500) : '',
    yes ? 1 + guests : 0,
    LANGS.indexOf(clean_(data.idioma, 5)) >= 0 ? clean_(data.idioma, 5) : '',
    new Date(),
    id,
    '',
    keyHash,
    1,
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

      // Mismo teléfono (aunque escrito distinto) = la misma persona: se actualiza SU fila, nunca se duplica.
      const pkey = phoneKey_(phone);
      const phones = sheet.getRange(2, COL_PHONE, last - 1, 1).getDisplayValues();
      for (let i = 0; i < phones.length; i++) {
        if (phoneKey_(phones[i][0]) !== pkey) continue;
        const prev = sheet.getRange(i + 2, 1, 1, HEADERS.length).getValues()[0];
        const fromOther = !keyHash || (prev[COL.edit_key] && prev[COL.edit_key] !== keyHash);
        const before = prev[COL.attending] === 'Yes'
          ? 'Yes, ' + (prev[COL.guests] || 0) + ' guest(s)' + (prev[COL.guest_names] ? ' (' + prev[COL.guest_names] + ')' : '')
          : String(prev[COL.attending] || '?');
        const entry = Utilities.formatDate(new Date(), 'Europe/Tirane', 'yyyy-MM-dd HH:mm') + ' resent'
          + (fromOther ? ' FROM ANOTHER DEVICE' : '') + ' (was: ' + before + ', name: ' + prev[COL.name] + ')';
        row[COL.note] = String(prev[COL.note] ? prev[COL.note] + ' | ' + entry : entry).slice(-1500);
        row[COL.times_sent] = (Number(prev[COL.times_sent]) || 1) + 1;
        // Se conserva la clave del primer dispositivo (el del dueño original).
        row[COL.edit_key] = prev[COL.edit_key] || keyHash;
        sheet.getRange(i + 2, 1, 1, HEADERS.length).setValues([row]);
        updated = true;
        break;
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

/** Límite global de envíos por minuto (caché del script, sin datos personales). */
function underRateLimit_() {
  const cache = CacheService.getScriptCache();
  const bucket = 'rl:' + Math.floor(Date.now() / 60000);
  const n = Number(cache.get(bucket) || 0) + 1;
  cache.put(bucket, String(n), 120);
  return n <= MAX_PER_MINUTE;
}

/** Hash SHA-256 en hexadecimal. */
function sha256_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); })
    .join('');
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
