// Texturas como SVG en data URI. Se exponen como custom properties en <html>.
import { LINEN, stitchPaths, tileCells } from './qendisje';

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** Grano de papel: motas cálidas casi transparentes. Tesela de 200 px. */
export const grain = svgUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>` +
    `<filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/>` +
    `<feColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 0 0.09 0.32 0 0 0 -0.13'/></filter>` +
    `<rect width='200' height='200' filter='url(#n)'/></svg>`,
);

/** Forro: bordado en punto de cruz sobre lino. Tesela de 48 px (16 puntos de 3 px). */
export const QENDISJE_TILE = 48;
export const qendisje = svgUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>` +
    `<rect width='48' height='48' fill='${LINEN}'/>${stitchPaths(tileCells(), 3)}</svg>`,
);

export const textureVars = `--grain:${grain};--qendisje:${qendisje};--linen:${LINEN}`;
