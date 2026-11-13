// @ts-check
import { defineConfig } from 'astro/config';

// En local: site = localhost y base = '/'.
// En GitHub Pages el workflow pasa SITE_URL (https://usuario.github.io) y
// BASE_PATH (/nombre-repo/). Con dominio propio: BASE_PATH = '/'.
export default defineConfig({
  // La barra de Astro flota abajo en el centro y tapa botones del formulario en el móvil.
  devToolbar: { enabled: false },
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  i18n: {
    locales: ['sq', 'en', 'de'],
    defaultLocale: 'sq',
    routing: { prefixDefaultLocale: false },
  },
});
