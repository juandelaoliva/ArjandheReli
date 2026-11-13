// Acuarela procedural: manchas orgánicas y ramas de olivo. Determinista (misma semilla, mismo dibujo).
// Los filtros que las vuelven «mojadas» están en WatercolorDefs.astro.

type Pt = [number, number];

const rnd = (seed: number) => {
  let s = (seed * 9301 + 49297) % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const pt = (p: Pt) => `${r2(p[0])} ${r2(p[1])}`;

/** Mancha orgánica en un viewBox -100..100. */
export function blob(seed: number, radius = 62, wobble = 16, n = 9): string {
  const R = rnd(seed);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rad = radius + (R() - 0.5) * 2 * wobble;
    pts.push([Math.cos(a) * rad, Math.sin(a) * rad * (0.82 + R() * 0.3)]);
  }
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return `${d} Z`;
}

const lens = (base: Pt, dir: Pt, L: number, w: number) => {
  const n: Pt = [-dir[1], dir[0]];
  const tip: Pt = [base[0] + dir[0] * L, base[1] + dir[1] * L];
  const mid: Pt = [base[0] + dir[0] * L * 0.5, base[1] + dir[1] * L * 0.5];
  const c1: Pt = [mid[0] + n[0] * L * w, mid[1] + n[1] * L * w];
  const c2: Pt = [mid[0] - n[0] * L * w, mid[1] - n[1] * L * w];
  return `M${pt(base)} Q${pt(c1)} ${pt(tip)} Q${pt(c2)} ${pt(base)} Z`;
};

/** Rama de olivo en un viewBox 0..200 × 0..300: tallo, hojas alternas y un par de aceitunas. */
export function oliveBranch(seed: number, leaves = 11) {
  const R = rnd(seed);
  const P0: Pt = [40, 292], P1: Pt = [150, 170], P2: Pt = [92, 14];
  const bez = (t: number): Pt => {
    const u = 1 - t;
    return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
  };
  const der = (t: number): Pt => {
    const u = 1 - t;
    const d: Pt = [2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]), 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])];
    const l = Math.hypot(d[0], d[1]);
    return [d[0] / l, d[1] / l];
  };
  const leafPaths: string[] = [];
  const olives: Pt[] = [];
  // Puntos del tallo donde se pintan flores (de mayor a menor hacia la punta).
  const blooms = [
    { t: 0.3, s: 1.0 }, { t: 0.52, s: 0.82 }, { t: 0.74, s: 0.62 },
  ].map(({ t, s }, i) => {
    const p = bez(t), u = der(t), n: Pt = [-u[1], u[0]];
    const side = i % 2 ? 1 : -1;
    return { x: r2(p[0] + n[0] * side * 12), y: r2(p[1] + n[1] * side * 12), s, rot: Math.round(R() * 360) };
  });
  for (let i = 0; i < leaves; i++) {
    const t = 0.1 + (i / (leaves - 1)) * 0.82;
    const p = bez(t), u = der(t), n: Pt = [-u[1], u[0]];
    const side = i % 2 ? 1 : -1;
    const spread = 0.62 + R() * 0.25;
    const dir: Pt = [u[0] * Math.cos(spread) + n[0] * side * Math.sin(spread), u[1] * Math.cos(spread) + n[1] * side * Math.sin(spread)];
    leafPaths.push(lens(p, dir, (34 - t * 14) * (0.85 + R() * 0.3), 0.22));
    if (i === 3 || i === 7) olives.push([p[0] + n[0] * side * 9, p[1] + n[1] * side * 9]);
  }
  leafPaths.push(lens(bez(1), der(1), 22, 0.22));
  const stem = `M${pt(P0)} Q${pt(P1)} ${pt(P2)}`;
  return { stem, leaves: leafPaths, olives, blooms };
}

/** Flor de acuarela en un viewBox -50..50: tres anillos de pétalos (peonía) y un centro con puntos. */
export function blossom(seed: number, petals = 6) {
  const R = rnd(seed);
  const petal = (L: number, w: number) =>
    `M0 0 C${r2(-w)} ${r2(-L * 0.28)} ${r2(-w * 0.95)} ${r2(-L * 0.96)} 0 ${r2(-L)} C${r2(w * 0.95)} ${r2(-L * 0.96)} ${r2(w)} ${r2(-L * 0.28)} 0 0 Z`;
  const ring = (n: number, L: number, w: number, offset: number) =>
    Array.from({ length: n }, (_, i) => ({
      d: petal(L * (0.9 + R() * 0.2), w * (0.9 + R() * 0.2)),
      rot: Math.round(offset + (i / n) * 360 + (R() - 0.5) * 14),
    }));
  return {
    outer: ring(petals, 24, 14, 0),
    mid: ring(petals - 1, 17, 11, 25),
    inner: ring(Math.max(4, petals - 2), 10, 7.5, 12),
    dots: Array.from({ length: 6 }, () => [r2((R() - 0.5) * 7), r2((R() - 0.5) * 7)] as Pt),
  };
}
