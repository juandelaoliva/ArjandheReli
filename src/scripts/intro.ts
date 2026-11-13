// Intro del sobre. Portado del prototipo invitacion-reliana-arjanfromClaude.html.
//
// Cada solapa se dibuja una sola vez (SVG convertido en imagen) y se reparte en bandas de <canvas>,
// encadenadas desde la bisagra hasta la punta: girando un poco cada una respecto a la anterior,
// la solapa se curva como el papel. Durante la animación el navegador solo mueve imágenes ya
// pintadas (Web Animations API), lo que evita tirones en pantallas grandes.
// Debajo del sobre está la portada real; al abrirse se queda como página.

type Pt = [number, number];

const SEEN_KEY = 'intro-vista';
const ENVELOPE_COLOR = '#e3d6bf';
const PAPER_COLOR = '#fafaf7';

const safeStorage = <T>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

/* ---------- Utilidades ---------- */
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r2 = (n: number) => Math.round(n * 100) / 100;
const pt = (p: Pt) => `${r2(p[0])} ${r2(p[1])}`;
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

function setup(intro: HTMLElement) {
  const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = intro) => root.querySelector<T>(sel)!;
  const root = document.documentElement;
  const flapsEl = q('.flaps');
  const seal = q<HTMLButtonElement>('.seal');
  const sheen = q<SVGRectElement>('.sheen', seal);
  const hint = q('.hint');
  const vignette = q('.vignette');
  const skip = q<HTMLButtonElement>('.skip');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  /* Grano de papel, generado una vez */
  const NOISE = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(128, 128);
    const r = rng(7);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() > 0.5 ? 255 : 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.floor(r() * 20);
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  })();

  /* Lacre: borde irregular de cera */
  (() => {
    const N = 72;
    const pts: Pt[] = [];
    const bumps = [[0.55, 3.2, 0.22], [2.45, 2.4, 0.3], [4.35, 3.8, 0.18], [5.4, 1.6, 0.25]];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      let rad = 47.5 + 1.3 * Math.sin(3 * a + 0.4) + 0.9 * Math.sin(7 * a + 1.3) + 0.45 * Math.sin(13 * a + 2.1);
      for (const [c, amp, w] of bumps) {
        const d = Math.atan2(Math.sin(a - c), Math.cos(a - c));
        rad += amp * Math.exp(-(d * d) / (2 * w * w));
      }
      pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    let d = `M${pt(pts[0])}`;
    for (let i = 0; i < N; i++) {
      const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
    }
    document.querySelectorAll('.seal-blob-shape').forEach((el) => el.setAttribute('d', `${d} Z`));
  })();

  /* Lacre: corona de olivo alrededor del monograma */
  (() => {
    const R = 24.4, N = 7, rad = Math.PI / 180, spread = 38 * rad;
    let leaves = '', stems = '';
    const leaf = (b: Pt, dir: Pt, L: number) => {
      const n: Pt = [-dir[1], dir[0]], w = L * 0.36;
      const tip: Pt = [b[0] + dir[0] * L, b[1] + dir[1] * L];
      const mid: Pt = [b[0] + dir[0] * L * 0.5, b[1] + dir[1] * L * 0.5];
      return `M${pt(b)} Q${pt([mid[0] + n[0] * w, mid[1] + n[1] * w])} ${pt(tip)} Q${pt([mid[0] - n[0] * w, mid[1] - n[1] * w])} ${pt(b)} Z`;
    };
    for (const s of [1, -1]) {
      const P = (a: number): Pt => [s * R * Math.cos(a * rad), R * Math.sin(a * rad)];
      const a0 = 82, a1 = 234;
      stems += `M${pt(P(a0))} A${R} ${R} 0 0 ${s === 1 ? 1 : 0} ${pt(P(a1))} `;
      for (let i = 0; i < N; i++) {
        const a = a0 + 22 + i * ((a1 - a0 - 26) / (N - 1));
        const p = P(a);
        const t: Pt = [-s * Math.sin(a * rad), Math.cos(a * rad)];
        const out: Pt = [s * Math.cos(a * rad), Math.sin(a * rad)];
        const L = 6.3 * (1 - i * 0.05);
        for (const k of [1, -1]) {
          const dir: Pt = [t[0] * Math.cos(spread) + out[0] * k * Math.sin(spread), t[1] * Math.cos(spread) + out[1] * k * Math.sin(spread)];
          const len = k === 1 ? L : L * 0.82;
          leaves += leaf([p[0] + dir[0] * 0.4, p[1] + dir[1] * 0.4], dir, len);
        }
      }
      const end = P(a1), t1: Pt = [-s * Math.sin(a1 * rad), Math.cos(a1 * rad)];
      leaves += leaf(end, t1, 5.2);
    }
    q('.wreath-leaves', document).setAttribute('d', leaves);
    q('.wreath-stems', document).setAttribute('d', stems.trim());
  })();

  /* Triángulo con la punta redondeada */
  function flapPaths(A: Pt, T: Pt, B: Pt, r: number) {
    const p1 = lerp(T, A, r / dist(T, A));
    const p2 = lerp(T, B, r / dist(T, B));
    const open = `M${pt(A)} L${pt(p1)} Q${pt(T)} ${pt(p2)} L${pt(B)}`;
    return { open, closed: `${open} Z` };
  }

  /* Relieve: ramas de olivo con flores y capullos */
  interface BranchSpec {
    P0: Pt; P1: Pt; P2: Pt; leaf: number; count: number;
    from?: number; to?: number; spread?: number; unit?: number;
    berries?: [number, number][]; flowers?: [number, number, number][]; buds?: [number, number][];
    tipLeaf?: boolean; X?: (q: Pt) => Pt;
  }

  function branch(spec: BranchSpec) {
    const { P0, P1, P2, leaf: L0, count, from = 0.07, to = 0.93, spread = 36, unit = 1,
            berries = [], flowers = [], buds = [], tipLeaf = true, X = (p: Pt) => p } = spec;
    const bez = (t: number): Pt => { const u = 1 - t; return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]]; };
    const der = (t: number): Pt => { const u = 1 - t; const d = [2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]), 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])]; const l = Math.hypot(d[0], d[1]); return [d[0] / l, d[1] / l]; };
    const lens = (base: Pt, dir: Pt, L: number, wf: number) => {
      const n: Pt = [-dir[1], dir[0]], w = L * wf;
      const b: Pt = [base[0] + dir[0] * L * 0.05, base[1] + dir[1] * L * 0.05];
      const tip: Pt = [base[0] + dir[0] * L, base[1] + dir[1] * L];
      const mid: Pt = [base[0] + dir[0] * L * 0.5, base[1] + dir[1] * L * 0.5];
      const c1: Pt = [mid[0] + n[0] * w, mid[1] + n[1] * w], c2: Pt = [mid[0] - n[0] * w, mid[1] - n[1] * w];
      return `M${pt(X(b))} Q${pt(X(c1))} ${pt(X(tip))} Q${pt(X(c2))} ${pt(X(b))} Z`;
    };
    const dot = (c: Pt, rx: number, ry = rx) => {
      const p = X(c);
      return `M${r2(p[0] - rx)} ${r2(p[1])} A${r2(rx)} ${r2(ry)} 0 1 0 ${r2(p[0] + rx)} ${r2(p[1])} A${r2(rx)} ${r2(ry)} 0 1 0 ${r2(p[0] - rx)} ${r2(p[1])} Z`;
    };
    const flower = (c: Pt, R: number, rot: number) => {
      let d = '';
      for (let i = 0; i < 5; i++) {
        const a = rot + (i * 2 * Math.PI) / 5, dir: Pt = [Math.cos(a), Math.sin(a)];
        d += lens([c[0] + dir[0] * R * 0.26, c[1] + dir[1] * R * 0.26], dir, R * 0.74, 0.62);
      }
      return d + dot(c, R * 0.16);
    };
    const off = (t: number, side: number, dst: number): Pt => { const p = bez(t), u = der(t); return [p[0] - u[1] * side * dst, p[1] + u[0] * side * dst]; };

    const ang = (spread * Math.PI) / 180;
    let fill = '';
    for (let i = 0; i < count; i++) {
      const t = from + i * ((to - from) / Math.max(1, count - 1));
      const p = bez(t), u = der(t), n: Pt = [-u[1], u[0]], s = i % 2 ? 1 : -1;
      const dir: Pt = [u[0] * Math.cos(ang) + n[0] * s * Math.sin(ang), u[1] * Math.cos(ang) + n[1] * s * Math.sin(ang)];
      fill += lens(p, dir, L0 * (1 - 0.32 * t), 0.24);
    }
    if (tipLeaf) fill += lens(bez(1), der(1), L0 * 0.7, 0.24);
    berries.forEach(([t, side]) => { fill += dot(off(t, side, unit * 0.026), unit * 0.012, unit * 0.015); });
    flowers.forEach(([t, side, k]) => { fill += flower(off(t, side, unit * 0.045 * k), L0 * 0.44 * k, t * 5.3 + side); });
    buds.forEach(([t, side]) => {
      const u = der(t), n: Pt = [-u[1], u[0]];
      const dir: Pt = [u[0] * 0.55 + n[0] * side * 0.83, u[1] * 0.55 + n[1] * side * 0.83];
      fill += lens(bez(t), dir, L0 * 0.42, 0.42);
    });
    return { fill, stem: `M${pt(X(P0))} Q${pt(X(P1))} ${pt(X(P2))}` };
  }

  interface Geo { W: number; H: number; cx: number; cy: number; m: number }
  type FlapName = 'top' | 'bottom' | 'left' | 'right';

  function ornaments(g: Geo, name: FlapName) {
    const { W, H, cx, cy, m } = g;
    const specs: BranchSpec[] = [];
    if (name === 'left' || name === 'right') {
      const X = name === 'right' ? (p: Pt): Pt => [W - p[0], p[1]] : (p: Pt) => p;
      specs.push(
        // rama principal
        { P0: [0.12 * cx, cy + 0.34 * H], P1: [0.66 * cx, cy + 0.02 * H], P2: [0.3 * cx, cy - 0.31 * H], leaf: m * 0.085, count: 10,
          berries: [[0.36, 1], [0.62, -1]], flowers: [[0.24, -1, 1], [0.5, 1, 1.15], [0.82, -1, 0.9]], buds: [[0.12, 1], [0.7, 1]] },
        // ramita alta junto a la bisagra
        { P0: [0.03 * cx, cy - 0.01 * H], P1: [0.2 * cx, cy - 0.12 * H], P2: [0.08 * cx, cy - 0.25 * H], leaf: m * 0.055, count: 6,
          from: 0.15, flowers: [[0.55, 1, 0.75]], buds: [[0.3, -1]] },
        // ramita baja junto a la bisagra
        { P0: [0.03 * cx, cy + 0.05 * H], P1: [0.2 * cx, cy + 0.15 * H], P2: [0.06 * cx, cy + 0.27 * H], leaf: m * 0.05, count: 5,
          from: 0.2, berries: [[0.5, -1]], buds: [[0.75, 1]] },
      );
      specs.forEach((sp) => { sp.X = X; });
    } else {
      // guirnalda: dos ramas que salen del centro hacia los lados, con una flor en el nudo
      const Y = name === 'top' ? (y: number) => y * H : (y: number) => H - y * H;
      const yb = name === 'top' ? 0.105 : 0.17;
      for (const flip of [false, true]) {
        specs.push({
          P0: [cx - 0.05 * cx, Y(yb)], P1: [cx - 0.36 * cx, Y(yb + 0.035)], P2: [cx - 0.7 * cx, Y(yb - 0.03)],
          leaf: m * 0.055, count: 8, from: 0.12, flowers: [[0.48, 1, 0.8]], buds: [[0.78, -1]],
          X: flip ? (p: Pt): Pt => [W - p[0], p[1]] : (p: Pt) => p,
        });
      }
    }
    let leaves = '', stem = '';
    specs.forEach((sp) => { const b = branch({ unit: m, ...sp }); leaves += b.fill; stem += `${b.stem} `; });
    if (name === 'top' || name === 'bottom') {
      const yb = name === 'top' ? 0.105 * H : H - 0.17 * H;
      leaves += branch({ P0: [cx, yb], P1: [cx + 0.5, yb], P2: [cx + 1, yb], leaf: m * 0.05, count: 0, tipLeaf: false, unit: m,
        flowers: [[0, 0, 1.25]] }).fill;
    }
    return { leaves, stem: stem.trim(), stroke: r2(m * 0.006) };
  }

  /* ---------- Construcción de las solapas ---------- */
  /* Intensidad del relieve. Solo cambia cuánto se nota, no de qué color es:
       · transparencia: deja ver el papel;
       · contraste: comprime luces y sombras del relieve ALREDEDOR DEL TONO PROPIO del yeso (no hacia un gris medio),
         así el color medio de las piezas es el mismo en los tres niveles.
     El color del yeso (el de «Fuerte») no se desatura en Media ni en Suave. */
  const LOOKS = {
    fuerte: { opacity: 0.94, contrast: 1 },
    media: { opacity: 0.7, contrast: 0.9 },
    suave: { opacity: 0.5, contrast: 0.8 },
  } as const;
  type Look = (typeof LOOKS)[keyof typeof LOOKS];
  const currentLook = (): Look => {
    const k = intro.dataset.intensity as keyof typeof LOOKS;
    return LOOKS[k in LOOKS ? k : 'media'];
  };
  const PLASTER_LUMA = 0.86; // brillo medio del yeso: pivote del contraste
  // Las tiras horizontales del «marco» son algo más grises que el resto de piezas: se les devuelve color.
  const FRAME_SATURATE = 1.25;
  let decoLook: Look = LOOKS.media;
  const decoFilter = (l: Look) => {
    const intercept = r2(PLASTER_LUMA * (1 - l.contrast));
    const ramp = `<feComponentTransfer>
        <feFuncR type="linear" slope="${l.contrast}" intercept="${intercept}"/>
        <feFuncG type="linear" slope="${l.contrast}" intercept="${intercept}"/>
        <feFuncB type="linear" slope="${l.contrast}" intercept="${intercept}"/>
      </feComponentTransfer>`;
    return `<filter id="deco-tone" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">${ramp}</filter>
    <filter id="deco-tone-frame" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="${FRAME_SATURATE}"/>${ramp}
    </filter>`;
  };
  const decoAttr = (frame = false) => `opacity="${decoLook.opacity}" filter="url(#deco-tone${frame ? '-frame' : ''})"`;
  const decoSvg = (d: { uri: string }, p: { x: number; y: number; w: number; h: number }, frame = false) =>
    `<image href="${d.uri}" x="${r2(p.x)}" y="${r2(p.y)}" width="${r2(p.w)}" height="${r2(p.h)}" preserveAspectRatio="none" ${decoAttr(frame)}/>`;
  const BANDS = 6;
  interface Band { el: HTMLElement; dark: HTMLCanvasElement; light: HTMLCanvasElement | null }
  let flaps: Partial<Record<FlapName, { bands: Band[] }>> = {};
  let builtKey = '';
  let building: Promise<void> | null = null;
  let buildSeq = 0;
  let fallback = false;

  const flapScale = (W: number, H: number) => Math.min(window.devicePixelRatio || 1, W * H > 1.5e6 ? 1.5 : 2);
  const envelopeColor = () => getComputedStyle(intro).getPropertyValue('--envelope').trim() || ENVELOPE_COLOR;
  const flapKey = () => {
    const W = intro.clientWidth, H = intro.clientHeight;
    return `${W}x${H}|${envelopeColor()}|${flapScale(W, H)}|${currentDeco()}|${currentLayout()}|${intro.dataset.intensity ?? 'media'}`;
  };
  const loadImage = (svg: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo dibujar la solapa'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  /* Decoraciones de relieve (imágenes con transparencia). Dentro de un SVG usado como imagen no se pueden
     enlazar archivos externos: se incrustan como data URI. */
  interface Deco { uri: string; w: number; h: number }
  const decoCache = new Map<string, Promise<Deco>>();
  const loadDeco = (url: string): Promise<Deco> => {
    let p = decoCache.get(url);
    if (!p) {
      p = fetch(url)
        .then((r) => r.blob())
        .then((blob) => new Promise<Deco>((resolve, reject) => {
          const fr = new FileReader();
          fr.onerror = () => reject(fr.error);
          fr.onload = () => {
            const uri = String(fr.result);
            const im = new Image();
            im.onload = () => resolve({ uri, w: im.naturalWidth, h: im.naturalHeight });
            im.onerror = () => reject(new Error('Decoración no válida'));
            im.src = uri;
          };
          fr.readAsDataURL(blob);
        }));
      decoCache.set(url, p);
    }
    return p;
  };
  const decoSets = JSON.parse(intro.dataset.decos || '{}') as Record<string, Record<FlapName, string>>;
  const medallonUrls = JSON.parse(intro.dataset.medallones || '{}') as { top: string; bottom: string };
  const currentDeco = () => {
    const key = intro.dataset.deco ?? '';
    return decoSets[key] ? key : 'olivo';
  };
  /** Qué va en las solapas de arriba y abajo: medallones, enredaderas diagonales, marco horizontal o nada. */
  const currentLayout = () => intro.dataset.top ?? 'medallones';

  function buildFlaps() {
    const seq = ++buildSeq;
    const job: Promise<void> = doBuild(seq)
      .catch((err) => { console.warn(err); fallback = true; })
      .finally(() => { if (building === job) building = null; });
    building = job;
    return job;
  }

  async function doBuild(seq: number) {
    const W = intro.clientWidth, H = intro.clientHeight;
    if (!W || !H) return;
    const cx = W / 2, cy = H / 2, m = Math.min(W, H);
    const g: Geo = { W, H, cx, cy, m };
    const e = 2, pad = 32, r = m * 0.075, ov = m * 0.09, touch = r * 0.32, ol = 1;
    const color = envelopeColor();
    // En sobres claros, el relieve y las sombras usan un marrón cálido y suave en vez de negro.
    const rgb = (color.match(/[0-9a-f]{2}/gi) || ['3A', '5A', '80']).slice(0, 3).map((h) => parseInt(h, 16) / 255);
    const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    const tone = lum > 0.6
      ? { embossDark: 'rgba(122,96,64,.2)', embossLight: 'rgba(255,255,255,.7)', shadow: '#7A6040', shadowK: 0.5, gradK: 0.45, shade: '#5C4630', vignette: 'rgba(110,86,56,.12)' }
      : { embossDark: 'rgba(0,0,0,.34)', embossLight: 'rgba(255,255,255,.2)', shadow: '#000', shadowK: 1, gradK: 1, shade: '#000', vignette: 'rgba(0,0,0,.26)' };
    const dpr = flapScale(W, H);
    const key = flapKey();

    // Orden de pintado: superior e inferior debajo, laterales encima (como en un sobre real).
    const defs = {
      top:    { A: [-e, -e] as Pt, T: [cx, cy + ov] as Pt, B: [W + e, -e] as Pt, axis: 'y', dir: 1, hinge: -e, origin: '50% 0%',
                grad: [cx, 0, cx, cy, '#FFFFFF', 0.07, '#000000', 0.05], shadow: [2, 6, 0.22], edge: 0.14 },
      bottom: { A: [-e, H + e] as Pt, T: [cx, cy - ov] as Pt, B: [W + e, H + e] as Pt, axis: 'y', dir: -1, hinge: H + e, origin: '50% 100%',
                grad: [cx, H, cx, cy, '#000000', 0.16, '#FFFFFF', 0.02], shadow: [1, 6, 0.22], edge: 0.1 },
      left:   { A: [-e, -e] as Pt, T: [cx + touch, cy] as Pt, B: [-e, H + e] as Pt, axis: 'x', dir: 1, hinge: -e, origin: '0% 50%',
                grad: [0, cy, cx, cy, '#000000', 0.1, '#FFFFFF', 0.03], shadow: [3, 7, 0.4], edge: 0.12 },
      right:  { A: [W + e, -e] as Pt, T: [cx - touch, cy] as Pt, B: [W + e, H + e] as Pt, axis: 'x', dir: -1, hinge: W + e, origin: '100% 50%',
                grad: [W, cy, cx, cy, '#000000', 0.1, '#FFFFFF', 0.03], shadow: [3, 7, 0.4], edge: 0.12 },
    } as const;

    // Decoración de relieve: se cargan las cuatro piezas (o se usa el olivo dibujado por código).
    const decoName = currentDeco();
    const look = currentLook();
    decoLook = look;
    const decoImgs = decoName === 'olivo'
      ? null
      : await Promise.all((['top', 'bottom', 'left', 'right'] as FlapName[]).map((n) => loadDeco(decoSets[decoName][n]))).then(
          ([top, bottom, left, right]) => ({ top, bottom, left, right }),
        ).catch((err) => { console.warn(err); return null; });
    const layout = currentLayout();
    const medallions = decoImgs && layout === 'medallones'
      ? await Promise.all([loadDeco(medallonUrls.top), loadDeco(medallonUrls.bottom)]).then(([top, bottom]) => ({ top, bottom })).catch((err) => { console.warn(err); return null; })
      : null;
    if (seq !== buildSeq) return;

    /** Coloca la decoración dentro de su solapa, ajustada a la forma del triángulo para que no se corte. */
    const placeDeco = (name: FlapName, d: Deco) => {
      const thin = d.w / d.h > 4; // piezas finas (sutil) o anchas (clásico)
      if (name === 'top' || name === 'bottom') {
        const tipDepth = cy + ov; // distancia del borde al vértice del triángulo
        let w = W * (thin ? 0.8 : 0.7);
        let h = (w * d.h) / d.w;
        let y = 0;
        for (let i = 0; i < 6; i++) {
          y = H * (thin ? 0.105 : 0.068);
          h = (w * d.h) / d.w;
          const far = y + h; // profundidad del punto más lejano del borde
          w = Math.min(w, W * (1 - far / tipDepth) * 0.97);
        }
        h = (w * d.h) / d.w;
        const depthTop = H * (thin ? 0.105 : 0.068);
        return { x: cx - w / 2, y: name === 'top' ? depthTop : H - depthTop - h, w, h };
      }
      const h = H * (thin ? 0.6 : 0.62);
      const w = (h * d.w) / d.h;
      const y = H * 0.19;
      const x = name === 'left' ? W * 0.03 : W - W * 0.03 - w;
      return { x, y, w, h };
    };

    /** Rama que crece desde una esquina de la solapa hacia el vértice, pegada al borde y siguiendo su dirección. */
    const vine = (A: Pt, B: Pt, T: Pt, d: Deco) => {
      const dist = Math.hypot(T[0] - A[0], T[1] - A[1]);
      const ux = (T[0] - A[0]) / dist, uy = (T[1] - A[1]) / dist;
      const L = dist * 0.5;
      const w = (L * d.w) / d.h;
      // Normal hacia el interior del triángulo.
      let nx = -uy, ny = ux;
      const gx = (A[0] + B[0] + T[0]) / 3 - A[0], gy = (A[1] + B[1] + T[1]) / 3 - A[1];
      if (nx * gx + ny * gy < 0) { nx = -nx; ny = -ny; }
      const off = w * 0.5 + 3;
      const mid = dist * 0.04 + L / 2;
      const px = A[0] + ux * mid + nx * off, py = A[1] + uy * mid + ny * off;
      // La imagen crece hacia arriba (base abajo, capullos arriba): se gira para que «arriba» apunte al vértice.
      const rot = (Math.atan2(ux, -uy) * 180) / Math.PI;
      return `<image href="${d.uri}" x="${r2(px - w / 2)}" y="${r2(py - L / 2)}" width="${r2(w)}" height="${r2(L)}" preserveAspectRatio="none" ${decoAttr()} transform="rotate(${r2(rot)} ${r2(px)} ${r2(py)})"/>`;
    };
    /** Medallón floral en rombo, centrado en la solapa y con la punta hacia el vértice. */
    const medallion = (name: 'top' | 'bottom', d: Deco) => {
      const tipDepth = cy + ov;
      const depth = tipDepth * 0.36; // distancia del borde al centro del medallón
      const widthAtCenter = W * (1 - depth / tipDepth);
      const w = Math.min(widthAtCenter * 0.94, H * 0.5, W * 0.7);
      const h = (w * d.h) / d.w;
      const y = name === 'top' ? depth : H - depth;
      const rot = name === 'top' ? 0 : 180;
      return `<image href="${d.uri}" x="${r2(cx - w / 2)}" y="${r2(y - h / 2)}" width="${r2(w)}" height="${r2(h)}" preserveAspectRatio="none" ${decoAttr()} transform="rotate(${rot} ${r2(cx)} ${r2(y)})"/>`;
    };
    const decoArt = (name: FlapName): string => {
      if (!decoImgs) return '';
      if (name === 'left' || name === 'right') return decoSvg(decoImgs[name], placeDeco(name, decoImgs[name]));
      if (layout === 'ninguno') return ''; // solapas de arriba y abajo lisas
      if (layout === 'marco') return decoSvg(decoImgs[name], placeDeco(name, decoImgs[name]), true);
      if (layout === 'medallones' && medallions) return medallion(name, medallions[name]);
      const f = defs[name];
      return vine(f.A, f.B, f.T, decoImgs.left) + vine(f.B, f.A, f.T, decoImgs.right);
    };

    const frag = document.createDocumentFragment();
    const next: typeof flaps = {};
    for (const [name, d] of Object.entries(defs) as [FlapName, (typeof defs)[FlapName]][]) {
      // Geometría de las bandas (cada caja incluye 1 px de solape con la siguiente).
      const tip = d.axis === 'y' ? d.T[1] : d.T[0];
      const lim = d.axis === 'y' ? [-e, H + e] : [-e, W + e];
      const end = d.dir === 1 ? Math.min(lim[1], tip + pad) : Math.max(lim[0], tip - pad);
      const h = Math.abs(end - d.hinge) / BANDS;
      const boxes: { x: number; y: number; w: number; h: number }[] = [];
      for (let k = 0; k < BANDS; k++) {
        const a = d.hinge + d.dir * k * h;
        const lo = d.dir === 1 ? a : a - h;
        const sv = d.axis === 'y' ? { x: -e, y: lo, w: W + 2 * e, h } : { x: lo, y: -e, w: h, h: H + 2 * e };
        if (k < BANDS - 1) {
          if (d.axis === 'y') { sv.h += ol; if (d.dir === -1) sv.y -= ol; }
          else { sv.w += ol; if (d.dir === -1) sv.x -= ol; }
        }
        boxes.push(sv);
      }
      const ux0 = Math.min(...boxes.map((b) => b.x)), uy0 = Math.min(...boxes.map((b) => b.y));
      const uw = Math.max(...boxes.map((b) => b.x + b.w)) - ux0, uh = Math.max(...boxes.map((b) => b.y + b.h)) - uy0;
      const pxW = Math.max(1, Math.round(uw * dpr)), pxH = Math.max(1, Math.round(uh * dpr));
      const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${r2(ux0)} ${r2(uy0)} ${r2(uw)} ${r2(uh)}" preserveAspectRatio="none">`;

      // Dibujo del papel de la solapa
      const P = flapPaths(d.A, d.T, d.B, r);
      const br = ornaments(g, name);
      const [gx1, gy1, gx2, gy2, c0, o0, c1, o1] = d.grad;
      const [sdy, sstd, sop] = d.shadow;
      const art = `${head}
        <defs>
          <clipPath id="clip"><path d="${P.closed}"/></clipPath>
          <linearGradient id="grad" gradientUnits="userSpaceOnUse" x1="${r2(gx1 as number)}" y1="${r2(gy1 as number)}" x2="${r2(gx2 as number)}" y2="${r2(gy2 as number)}">
            <stop offset="0" stop-color="${c0}" stop-opacity="${c0 === '#000000' ? (o0 as number) * tone.gradK : o0}"/><stop offset="1" stop-color="${c1}" stop-opacity="${c1 === '#000000' ? (o1 as number) * tone.gradK : o1}"/>
          </linearGradient>
          <filter id="sh" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
            <feDropShadow dx="0" dy="${sdy}" stdDeviation="${sstd}" flood-color="${tone.shadow}" flood-opacity="${r2(sop * tone.shadowK)}"/>
          </filter>
          <pattern id="noise" patternUnits="userSpaceOnUse" width="64" height="64">
            <image href="${NOISE}" width="64" height="64" preserveAspectRatio="none"/>
          </pattern>
          ${decoImgs ? decoFilter(look) : `<g id="olive"><path d="${br.leaves}"/><path d="${br.stem}" fill="none" stroke-width="${br.stroke}" stroke-linecap="round"/></g>`}
        </defs>
        <path d="${P.closed}" fill="${color}" filter="url(#sh)"/>
        <g clip-path="url(#clip)">
          ${decoImgs ? decoArt(name) : `<use href="#olive" transform="translate(1.1 1.5)" fill="${tone.embossDark}" stroke="${tone.embossDark}"/>
          <use href="#olive" transform="translate(-.9 -1)" fill="${tone.embossLight}" stroke="${tone.embossLight}"/>
          <use href="#olive" fill="${color}" stroke="${color}"/>`}
          <rect x="${r2(ux0)}" y="${r2(uy0)}" width="${r2(uw)}" height="${r2(uh)}" fill="url(#grad)"/>
          <rect x="${r2(ux0)}" y="${r2(uy0)}" width="${r2(uw)}" height="${r2(uh)}" fill="url(#noise)"/>
        </g>
        <path d="${P.open}" fill="none" stroke="#FFFFFF" stroke-opacity="${d.edge}" stroke-width="1"/>
      </svg>`;
      const silhouette = (fill: string) => `${head}<path d="${P.closed}" fill="${fill}"/></svg>`;

      const [imgArt, imgDark, imgLight] = await Promise.all([
        loadImage(art), loadImage(silhouette(tone.shade)), name === 'top' ? loadImage(silhouette('#FFF')) : null,
      ]);
      if (seq !== buildSeq) return;

      const sx = imgArt.naturalWidth / uw, sy = imgArt.naturalHeight / uh;
      const slice = (img: HTMLImageElement, sv: (typeof boxes)[number], cls: string) => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sv.w * dpr));
        c.height = Math.max(1, Math.round(sv.h * dpr));
        c.className = cls;
        c.style.width = `${r2(sv.w)}px`;
        c.style.height = `${r2(sv.h)}px`;
        c.getContext('2d')!.drawImage(img, (sv.x - ux0) * sx, (sv.y - uy0) * sy, sv.w * sx, sv.h * sy, 0, 0, c.width, c.height);
        return c;
      };

      // Bandas encadenadas: cada una es hija de la anterior y gira sobre el borde que comparten.
      const bands: Band[] = [];
      let parent: HTMLElement | null = null;
      let prev: (typeof boxes)[number] | null = null;
      boxes.forEach((sv) => {
        const el = document.createElement('div');
        el.className = `band band--${name}`;
        Object.assign(el.style, {
          left: `${r2(prev ? sv.x - prev.x : sv.x)}px`,
          top: `${r2(prev ? sv.y - prev.y : sv.y)}px`,
          width: `${r2(sv.w)}px`, height: `${r2(sv.h)}px`,
          transformOrigin: d.origin,
        });
        // Papel y sombras van juntos en una cara plana, para que el navegador no los reordene en 3D.
        const face = document.createElement('div');
        face.className = 'face';
        face.append(slice(imgArt, sv, 'paper'));
        const light = imgLight ? slice(imgLight, sv, 'shade shade--light') : null;
        if (light) face.append(light);
        const dark = slice(imgDark, sv, 'shade shade--dark');
        face.append(dark);
        el.append(face);
        (parent || frag).append(el);
        bands.push({ el, dark, light });
        parent = el;
        prev = sv;
      });
      next[name] = { bands };
    }
    if (seq !== buildSeq) return;
    flapsEl.style.perspective = `${Math.round(Math.max(W, H) * 1.5)}px`;
    intro.style.setProperty('--flap-vignette', tone.vignette);
    flapsEl.replaceChildren(frag);
    flaps = next;
    builtKey = key;
    fallback = false;
  }

  /* ---------- Animación ---------- */
  const EASE_FLAP = 'cubic-bezier(.55,.06,.35,1)';
  const EASE_OUT = 'cubic-bezier(.2,.7,.2,1)';
  let anims: Animation[] = [];
  let idle: Animation[] = [];
  let state: 'closed' | 'opening' | 'open' = 'closed';

  const add = (el: Element, keyframes: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = el.animate(keyframes, { fill: 'both', ...opts });
    a.pause();
    anims.push(a);
    return a;
  };

  function buildOpenTimeline() {
    anims = [];
    if (reduceMotion.matches || fallback || !flaps.top) {
      add(seal, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      add(hint, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      add(flapsEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 150 });
      add(vignette, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 150 });
      return;
    }

    // 1. Se presiona el lacre, se despega del papel y se desvanece entero
    add(seal, [
      { transform: 'translateY(0) scale(1)', opacity: 1 },
      { transform: 'translateY(0) scale(.94)', opacity: 1, offset: 0.15 },
      { transform: 'translateY(-4%) scale(1.07)', opacity: 1, offset: 0.45 },
      { transform: 'translateY(-10%) scale(1.13)', opacity: 0 },
    ], { duration: 900, easing: 'cubic-bezier(.3,0,.35,1)' });
    add(hint, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: 'ease-out' });
    add(skip, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: 'ease-out' });

    // 2. Se abren las solapas (laterales primero) y se curvan un poco mientras giran
    const openFlap = (name: FlapName, rot: string, sign: number, curl: number, timing: KeyframeAnimationOptions, dark: Keyframe[], light?: Keyframe[]) => {
      flaps[name]!.bands.forEach((b, k) => {
        if (k === 0) {
          add(b.el, [{ transform: `${rot}(0deg)` }, { transform: `${rot}(${sign * 115}deg)` }], timing);
        } else {
          add(b.el, [
            { transform: `${rot}(0deg)` },
            { transform: `${rot}(${sign * curl}deg)`, offset: 0.4 },
            { transform: `${rot}(${sign * curl * 0.7}deg)`, offset: 0.72 },
            { transform: `${rot}(${sign * curl * 0.45}deg)` },
          ], timing);
        }
        add(b.dark, dark, timing);
        if (light && b.light) add(b.light, light, timing);
      });
    };
    const sideDark = [{ opacity: 0 }, { opacity: 0.26, offset: 0.45 }, { opacity: 0.55 }];
    const side = { delay: 420, duration: 2000, easing: EASE_FLAP };
    openFlap('left', 'rotateY', -1, 6, side, sideDark);
    openFlap('right', 'rotateY', 1, 6, side, sideDark);
    openFlap('top', 'rotateX', 1, 6.5, { delay: 690, duration: 2100, easing: EASE_FLAP },
      [{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 0.45 }],
      [{ opacity: 0 }, { opacity: 0.16, offset: 0.3 }, { opacity: 0, offset: 0.55 }, { opacity: 0 }]);
    openFlap('bottom', 'rotateX', -1, 6.5, { delay: 770, duration: 2000, easing: EASE_FLAP },
      [{ opacity: 0 }, { opacity: 0.34, offset: 0.5 }, { opacity: 0.6 }]);

    // 3. La cámara avanza hacia el interior; la portada ya está ahí y se asienta
    add(flapsEl, [{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }], { delay: 420, duration: 2400, easing: 'cubic-bezier(.45,0,.7,.4)' });
    add(flapsEl, [{ opacity: 1 }, { opacity: 0 }], { delay: 2120, duration: 500, easing: 'linear' });
    if (hero) add(hero, [{ transform: 'scale(.95)' }, { transform: 'scale(1)' }], { delay: 420, duration: 2600, easing: EASE_OUT });
    add(vignette, [{ opacity: 1 }, { opacity: 0 }], { delay: 760, duration: 2400, easing: 'ease-out' });
  }

  function startIdle() {
    idle.forEach((a) => a.cancel());
    idle = reduceMotion.matches ? [] : [
      sheen.animate([
        { transform: 'translateX(0px)' },
        { transform: 'translateX(0px)', offset: 0.45 },
        { transform: 'translateX(175px)' },
      ], { duration: 4200, delay: 800, iterations: Infinity, easing: 'cubic-bezier(.45,0,.3,1)' }),
    ];
  }

  /** Quita el sobre y deja la página navegable. */
  function teardown() {
    if (state === 'open') return;
    state = 'open';
    idle.forEach((a) => a.cancel());
    anims.forEach((a) => a.cancel());
    anims = [];
    window.removeEventListener('resize', onResize);
    intro.hidden = true;
    root.classList.remove('intro-lock');
    root.classList.add('intro-done');
    themeMeta?.setAttribute('content', PAPER_COLOR);
    safeStorage(() => localStorage.setItem(SEEN_KEY, '1'));
  }

  async function open() {
    if (state !== 'closed') return;
    // La música empieza en este mismo toque: los navegadores solo permiten audio dentro de un gesto del usuario.
    window.dispatchEvent(new CustomEvent('intro:open'));
    state = 'opening';
    idle.forEach((a) => a.cancel());
    idle = [];
    seal.style.pointerEvents = 'none';
    if (building) await building;
    if (builtKey !== flapKey()) await buildFlaps();
    buildOpenTimeline();
    anims.forEach((a) => a.play());
    state = 'opening';
    Promise.all(anims.map((a) => a.finished)).then(() => {
      state = 'closed'; // permite que teardown() corra
      teardown();
    }).catch(() => {});
  }

  let resizeTimer: number | undefined;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { if (state === 'closed') buildFlaps(); }, 150);
  }

  /* ---------- Controles de prueba: color del sobre y volver a cerrarlo ---------- */
  const proto = document.querySelector<HTMLElement>('[data-proto]');
  if (proto) {
    const closeBtn = q<HTMLButtonElement>('.close', proto);
    const toggle = q<HTMLButtonElement>('.proto-toggle', proto);
    const panel = q('.pill', proto);
    const setPanel = (open: boolean) => {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setPanel(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setPanel(false); });
    const swatches = Array.from(proto.querySelectorAll<HTMLButtonElement>('.swatch'));

    // Estilo de acuarela del interior: html[data-style]
    const styleBtns = Array.from(proto.querySelectorAll<HTMLButtonElement>('.style-btn[data-style]'));
    styleBtns.forEach((btn) => btn.addEventListener('click', () => {
      root.dataset.style = btn.dataset.style!;
      styleBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    }));

    // Decoración del sobre: relieve clásico, relieve sutil u olivo (la original).
    const decoBtns = Array.from(proto.querySelectorAll<HTMLButtonElement>('.deco-btn'));
    decoBtns.forEach((btn) => btn.addEventListener('click', () => {
      intro.dataset.deco = btn.dataset.deco!;
      decoBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (state === 'closed' && !intro.hidden) buildFlaps();
    }));

    // Intensidad del relieve del sobre.
    const intBtns = Array.from(proto.querySelectorAll<HTMLButtonElement>('.int-btn'));
    intBtns.forEach((btn) => btn.addEventListener('click', () => {
      intro.dataset.intensity = btn.dataset.intensity!;
      intBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (state === 'closed' && !intro.hidden) buildFlaps();
    }));

    // Composición de arriba y abajo: medallones, enredaderas o marco.
    const topBtns = Array.from(proto.querySelectorAll<HTMLButtonElement>('.top-btn'));
    topBtns.forEach((btn) => btn.addEventListener('click', () => {
      intro.dataset.top = btn.dataset.top!;
      topBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (state === 'closed' && !intro.hidden) buildFlaps();
    }));

    swatches.forEach((btn) => btn.addEventListener('click', () => {
      const color = btn.dataset.color!;
      intro.style.setProperty('--envelope', color);
      // En sobres claros el texto «Toca el sello» pasa a tinta oscura; en rojos el lacre pasa a dorado.
      if (btn.dataset.ink) root.style.setProperty('--on-envelope', btn.dataset.ink);
      if (btn.dataset.seal) intro.dataset.seal = btn.dataset.seal;
      else delete intro.dataset.seal;
      swatches.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (state === 'closed' && !intro.hidden) {
        themeMeta?.setAttribute('content', color);
        buildFlaps();
      }
    }));

    closeBtn.addEventListener('click', () => {
      anims.forEach((a) => a.cancel());
      anims = [];
      state = 'closed';
      intro.hidden = false;
      seal.style.pointerEvents = '';
      root.classList.add('intro-lock');
      root.classList.remove('intro-done');
      window.scrollTo(0, 0);
      themeMeta?.setAttribute('content', envelopeColor());
      window.addEventListener('resize', onResize);
      if (builtKey !== flapKey()) buildFlaps();
      startIdle();
      closeBtn.disabled = true;
    });

    // El botón «Cerrar el sobre» solo tiene sentido cuando está abierto.
    new MutationObserver(() => { closeBtn.disabled = !intro.hidden; })
      .observe(intro, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------- Arranque ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  root.classList.add('intro-lock');
  themeMeta?.setAttribute('content', ENVELOPE_COLOR);
  if (safeStorage(() => localStorage.getItem(SEEN_KEY))) skip.hidden = false;

  seal.addEventListener('click', open);
  skip.addEventListener('click', () => {
    state = 'closed';
    teardown();
  });
  window.addEventListener('resize', onResize);

  // Las fuentes del lacre (Bodoni) cuentan para el monograma: se espera a que estén listas.
  document.fonts?.ready.finally(() => {
    buildFlaps();
    startIdle();
  });
}

const intro = document.querySelector<HTMLElement>('[data-intro]');
if (intro) setup(intro);
