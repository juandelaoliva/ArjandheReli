// Prueba Code.gs en local con una hoja simulada: node scripts/probar-script-local.cjs apps-script/Code.gs
// Simulación mínima de Google Sheets / Apps Script para probar Code.gs en local.
const fs = require('fs'), crypto = require('crypto');
const rows = [];
const range = (r, c, nr, nc) => ({
  getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (rows[r - 1 + i] || [])[c - 1 + j] ?? '')),
  getDisplayValues() { return this.getValues().map(x => x.map(String)); },
  setValues(v) { v.forEach((rr, i) => { rows[r - 1 + i] = rows[r - 1 + i] || []; rr.forEach((x, j) => rows[r - 1 + i][c - 1 + j] = x); }); return this; },
  setFontWeight() { return this; },
  createTextFinder: (t) => ({ matchEntireCell() { return this; }, findNext: () => (Array.from({ length: nr }, (_, i) => (rows[r - 1 + i] || [])[c - 1]).some(x => String(x) === t) ? {} : null) }),
});
const sheet = { getLastRow: () => rows.length, getRange: range, appendRow: (r) => rows.push(r), setFrozenRows() {} };
global.SpreadsheetApp = { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet, insertSheet: () => sheet }) };
global.LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
const cache = {}; global.CacheService = { getScriptCache: () => ({ get: k => cache[k], put: (k, v) => cache[k] = v }) };
global.Utilities = { DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
  computeDigest: (_, t) => [...crypto.createHash('sha256').update(t).digest()].map(b => b > 127 ? b - 256 : b),
  formatDate: () => '2026-11-13 19:30' };
global.ContentService = { MimeType: { JSON: 1 }, createTextOutput: (t) => ({ setMimeType() { return t; } }) };
global.MailApp = { sendEmail() {} };
eval(fs.readFileSync(process.argv[2], 'utf8') + '\nglobal.doPost = doPost;');
let n = 0;
const send = (o) => JSON.parse(doPost({ postData: { contents: JSON.stringify({ id: 'id' + (++n), idioma: 'sq', website: '', ...o }) } }));
const A = 'a'.repeat(40), B = 'b'.repeat(40);
const show = (t, r) => console.log(t.padEnd(52), JSON.stringify(r), '→ filas:', rows.length - 1);
show('1) +355 69 123 4567, viene con 1 invitado (móvil A)', send({ nombre: 'Ana', telefono: '+355 69 123 4567', asiste: 'si', invitados: 1, nombres_invitados: 'Luis', clave: A }));
show('2) 069 123 4567 (con 0), mismo móvil A, 2 invitados', send({ nombre: 'Ana', telefono: '069 123 4567', asiste: 'si', invitados: 2, nombres_invitados: 'Luis, Marta', clave: A }));
show('3) 00355 69 123 4567 desde OTRO móvil, no viene', send({ nombre: 'Ana H.', telefono: '00355 69 123 4567', asiste: 'no', clave: B }));
show('4) +49 1575 0881183 (Alemania)', send({ nombre: 'Reli', telefono: '+49 1575 0881183', asiste: 'si', invitados: 0, clave: B }));
show('5) 01575 0881183 (Alemania con 0)', send({ nombre: 'Reli', telefono: '01575 0881183', asiste: 'si', invitados: 1, nombres_invitados: 'X', clave: B }));
show('6) otro número distinto', send({ nombre: 'Pepe', telefono: '+355 69 123 9999', asiste: 'si', invitados: 0, clave: A }));
show('7) reintento del mismo envío (mismo id)', JSON.parse(doPost({ postData: { contents: JSON.stringify({ id: 'id6', idioma: 'sq', website: '', nombre: 'Pepe', telefono: '+355 69 123 9999', asiste: 'si', clave: A }) } })));
console.log('\n' + rows[0].join(' | '));
for (const r of rows.slice(1)) console.log(['phone', 'name', 'attending', 'guests', 'guest_names', 'total', 'times_sent', 'note'].map(h => ({ phone: r[0], name: r[1], attending: r[2], guests: r[3], guest_names: r[4], total: r[5], times_sent: r[11], note: r[9] })[h]).join(' | '));
