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
 * Si alguien vuelve a enviar con el mismo contacto, su fila se sustituye (no se duplica).
 * La hoja está en inglés. Pestaña «Responses», una fila por envío:
 *   contact | name | attending | extra_adults | adult_names | menus | allergies | language | submitted_at | id
 */

const SHEET_NAME = 'Responses';
// Correo (o varios separados por comas) que recibe un aviso por cada respuesta. Vacío = sin avisos.
const NOTIFY_EMAIL = '';

const HEADERS = [
  'contact', 'name', 'attending', 'extra_adults', 'adult_names',
  'menus', 'allergies', 'language', 'submitted_at', 'id',
];
const COL_ID = HEADERS.indexOf('id') + 1; // columna del id (para detectar duplicados)

// El formulario envía los menús con sus claves internas; en la hoja van en inglés.
const MENU_EN = { general: 'Standard', vegetariano: 'Vegetarian', vegano: 'Vegan' };

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
  const nombre = clean_(data.nombre, 120);
  const contacto = clean_(data.contacto, 120);
  const raw = clean_(data.asiste, 3).toLowerCase();
  const attending = raw === 'si' || raw === 'yes' ? 'Yes' : raw === 'no' ? 'No' : '';
  if (!id || !nombre || !contacto || !attending) {
    return json_({ ok: false, error: 'missing_fields' });
  }

  const yes = attending === 'Yes';
  const adultos = Math.max(0, Math.min(4, parseInt(data.adultos_extra, 10) || 0));
  const row = [
    contacto,
    nombre,
    attending,
    yes ? adultos : 0,
    yes ? clean_(data.nombres_adultos, 500) : '',
    yes ? menus_(data.menus) : '',
    yes ? clean_(data.alergias, 800) : '',
    clean_(data.idioma, 5),
    new Date(),
    id,
  ];

  let updated = false;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    // Mismo id = reintento del mismo envío: no se duplica la fila.
    if (sheet.getLastRow() > 1) {
      const found = sheet.getRange(2, COL_ID, sheet.getLastRow() - 1, 1)
        .createTextFinder(id).matchEntireCell(true).findNext();
      if (found) return json_({ ok: true, duplicate: true });
    }
    // Mismo contacto (correo o teléfono) = la persona corrige su respuesta: se sustituye su fila.
    const prev = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
          .createTextFinder(contacto).matchEntireCell(true).matchCase(false).findNext()
      : null;
    if (prev) {
      sheet.getRange(prev.getRow(), 1, 1, HEADERS.length).setValues([row]);
      updated = true;
    } else {
      sheet.appendRow(row);
    }
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) notify_(row);
  return json_({ ok: true, updated: updated });
}

/** Comprobación rápida abriendo la URL en el navegador. */
function doGet() {
  return json_({ ok: true, service: 'rsvp' });
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

/** «Ana: vegetariano; Luis: general» → «Ana: Vegetarian; Luis: Standard». */
function menus_(value) {
  return clean_(value, 800).replace(/\b(general|vegetariano|vegano)\b/g, function (m) {
    return MENU_EN[m];
  });
}

/** Texto recortado y sin fórmulas: evita que «=…» o «+…» se ejecuten en la hoja. */
function clean_(value, max) {
  let s = String(value == null ? '' : value).trim();
  if (max) s = s.slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function notify_(row) {
  try {
    const [contacto, nombre, attending, extra, adultos, menus, alergias, idioma] = row;
    const comes = attending === 'Yes';
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: (comes ? 'RSVP confirmed: ' : 'Cannot attend: ') + nombre,
      body: [
        'Name: ' + nombre,
        'Contact: ' + contacto,
        'Language: ' + idioma,
        'Attending: ' + attending,
        comes ? 'Extra adults: ' + extra + (adultos ? ' (' + adultos + ')' : '') : '',
        comes ? 'Menus: ' + menus : '',
        comes && alergias ? 'Allergies: ' + alergias : '',
      ].filter(Boolean).join('\n'),
    });
  } catch (err) {
    // Un fallo de correo no debe impedir guardar la respuesta.
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
