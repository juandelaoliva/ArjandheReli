// Bordado albanés (qëndisje) en punto de cruz: hilo rojo y negro sobre lino.
// Se usa en el forro del sobre (tesela repetible) y en los ornamentos de la portada.

export const LINEN = '#f2eadb';
export const THREAD_RED = '#a3202b';
export const THREAD_BLACK = '#211d22';

export type Cell = { i: number; j: number; red: boolean };

/** Rombo escalonado con anillos alternos rojo/negro y el centro vacío. */
export function diamond(radius: number): Cell[] {
  const cells: Cell[] = [];
  for (let i = 0; i <= 2 * radius; i++) {
    for (let j = 0; j <= 2 * radius; j++) {
      const d = Math.abs(i - radius) + Math.abs(j - radius);
      if (d > radius || (radius - d) % 2 !== 0) continue;
      cells.push({ i, j, red: ((radius - d) / 2) % 2 === 0 });
    }
  }
  return cells;
}

/**
 * Tesela de 16×16 puntos: rombo grande en el centro y rombos pequeños en las esquinas.
 * Es simétrica respecto al centro de la celda 8 y de la celda 0 (lo usa la solapa).
 */
export function tileCells(): Cell[] {
  const T = 16;
  const C = 8;
  const cells: Cell[] = [];
  for (let i = 0; i < T; i++) {
    for (let j = 0; j < T; j++) {
      const d = Math.abs(i - C) + Math.abs(j - C);
      const corner = Math.min(i, T - i) + Math.min(j, T - j);
      if (d <= 6 && d % 2 === 0) cells.push({ i, j, red: (6 - d) % 4 === 0 });
      else if (corner <= 1) cells.push({ i, j, red: corner === 0 });
    }
  }
  return cells;
}

/** Cada celda es una X (dos puntadas). Devuelve los <path> en SVG. */
export function stitchPaths(cells: Cell[], size = 1): string {
  const f = (n: number) => +n.toFixed(2);
  const d = (red: boolean) =>
    cells
      .filter((c) => c.red === red)
      .map(({ i, j }) => {
        const x = i * size;
        const y = j * size;
        const p = size * 0.18;
        const q = size * 0.82;
        return `M${f(x + p)} ${f(y + p)}L${f(x + q)} ${f(y + q)}M${f(x + q)} ${f(y + p)}L${f(x + p)} ${f(y + q)}`;
      })
      .join('');
  const attrs = `stroke-width='${f(size * 0.34)}' stroke-linecap='round' fill='none'`;
  return `<path d='${d(true)}' stroke='${THREAD_RED}' ${attrs}/><path d='${d(false)}' stroke='${THREAD_BLACK}' ${attrs}/>`;
}
