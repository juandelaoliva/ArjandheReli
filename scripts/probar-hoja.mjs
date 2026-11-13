// Envía una respuesta de prueba al Apps Script, igual que lo hace el formulario (POST como texto plano).
// Uso: node scripts/probar-hoja.mjs https://script.google.com/macros/s/XXXX/exec
const url = process.argv[2] || process.env.PUBLIC_RSVP_ENDPOINT;
if (!url) {
  console.error('Falta la URL: node scripts/probar-hoja.mjs <url del Apps Script>');
  process.exit(1);
}

const datos = {
  id: crypto.randomUUID(),
  idioma: 'sq',
  nombre: 'PRUEBA Ana Ejemplo',
  contacto: 'prueba@example.com',
  asiste: 'si',
  adultos_extra: 1,
  nombres_adultos: 'Luis Ejemplo',
  menus: 'Ana: general; Luis: vegetariano',
  alergias: 'Ana: ninguna; Luis: frutos secos',
  website: '',
};

const res = await fetch(url, { method: 'POST', body: JSON.stringify(datos) }); // sin Content-Type
console.log('HTTP', res.status);
console.log(await res.text());
