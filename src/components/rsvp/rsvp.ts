// Lógica del formulario de confirmación (multipaso). Marcado y textos: RsvpForm.astro y src/i18n/rsvp.ts.

import type { RsvpText } from '../../i18n/rsvp';

type StepId = 's1' | 's2' | 'sum';

interface State {
  step: StepId;
  name: string;
  contacto: string;
  attending: '' | 'yes' | 'no';
  guest: '' | 'yes' | 'no'; // ¿trae un invitado?
  adults: number; // cuántos invitados trae
  adultNames: string[];
}

interface Config {
  t: RsvpText;
  lang: string;
  locale: string;
  timeZone: string;
  endpoint: string;
  dayMonth: string;
  months: string[];
  dateFormat: string;
  contacts: { nombre: string; whatsapp: string }[];
}

const PROGRESS_KEY = 'rsvp-progreso';
const SENT_KEY = 'rsvp-enviado';
const MAX_ADULTS = 4;

function store<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

function initialState(): State {
  return {
    step: 's1',
    name: '',
    contacto: '',
    attending: '',
    guest: '',
    adults: 0,
    adultNames: Array(MAX_ADULTS).fill(''),
  };
}

function setup(root: HTMLElement) {
  const cfg: Config = JSON.parse(root.dataset.config ?? '{}');
  const { t } = cfg;
  const fmt = (s: string, vars: Record<string, string | number>) =>
    s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const form = q<HTMLFormElement>('[data-form]');
  const labelEl = q('[data-step-label]');
  const barEl = q('[data-bar]');
  const errorEl = q('[data-error]');
  const backBtn = q<HTMLButtonElement>('[data-back]');
  const nextBtn = q<HTMLButtonElement>('[data-next]');
  const hp = q<HTMLInputElement>('input[name="website"]');
  const nameInput = q<HTMLInputElement>('[data-field="name"]');
  const contactInput = q<HTMLInputElement>('[data-field="contacto"]');
  const adultNamesEl = q('[data-adult-names]');
  const addGuestBtn = q<HTMLButtonElement>('[data-add-guest]');
  const summaryEl = q('[data-summary]');
  const alreadyEl = q('[data-already]');
  const doneEl = q('[data-done]');
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  const panel = (id: StepId) => panels.find((p) => p.dataset.step === id)!;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const state: State = initialState();
  let editing = false; // llegó desde «Editar» del resumen: «Continuar» vuelve al resumen
  let busy = false;

  /* ---------- Persistencia ---------- */
  const save = () => store(() => localStorage.setItem(PROGRESS_KEY, JSON.stringify(state)));
  const clearSaved = () => store(() => localStorage.removeItem(PROGRESS_KEY));

  function restore() {
    const raw = store(() => localStorage.getItem(PROGRESS_KEY));
    if (!raw) return;
    try {
      const s = JSON.parse(raw) as Partial<State>;
      const base = initialState();
      state.name = typeof s.name === 'string' ? s.name : base.name;
      state.contacto = typeof s.contacto === 'string' ? s.contacto : base.contacto;
      state.attending = s.attending === 'yes' || s.attending === 'no' ? s.attending : '';
      state.adults = Math.min(MAX_ADULTS, Math.max(0, Number(s.adults) || 0));
      state.adultNames = base.adultNames.map((_, i) => String(s.adultNames?.[i] ?? ''));
      state.guest = s.guest === 'yes' || s.guest === 'no' ? s.guest : state.adults > 0 ? 'yes' : '';
      // El antiguo paso 3 (comida) ya no existe: quien lo tenía guardado pasa al resumen.
      const saved = (s.step as string) === 's3' ? 'sum' : s.step;
      state.step = (['s1', 's2', 'sum'] as StepId[]).includes(saved as StepId) ? (saved as StepId) : 's1';
    } catch {
      /* progreso corrupto: se ignora */
    }
  }

  /* ---------- Pasos ---------- */
  const steps = (): StepId[] => (state.attending === 'no' ? ['s1', 'sum'] : ['s1', 's2', 'sum']);
  const personName = (i: number) =>
    i === 0
      ? state.name.trim() || t.you
      : state.adultNames[i - 1].trim() || fmt(t.companionN, { n: i });

  function updateChrome() {
    const list = steps();
    const idx = Math.max(0, list.indexOf(state.step));
    labelEl.textContent = fmt(t.stepOf, { n: idx + 1, total: list.length });
    barEl.style.setProperty('--progress', String((idx + 1) / list.length));
    backBtn.disabled = idx === 0;
    nextBtn.textContent =
      state.step === 'sum' ? (state.attending === 'no' ? t.submitNo : t.submitYes) : editing ? t.toSummary : t.next;
  }

  function renderStep(id: StepId) {
    if (id === 's2') renderAdults();
    if (id === 'sum') renderSummary();
  }

  const slide = (node: HTMLElement, from: number, to: number, ms: number, fade: [number, number]) => {
    const frames: Keyframe[] = reduceMotion.matches
      ? [{ opacity: fade[0] }, { opacity: fade[1] }]
      : [
          { opacity: fade[0], transform: `translateX(${from}px)` },
          { opacity: fade[1], transform: `translateX(${to}px)` },
        ];
    return node.animate(frames, { duration: ms, easing: 'ease-in-out' }).finished.catch(() => undefined);
  };

  async function go(to: StepId, dir: 1 | -1) {
    if (busy) return;
    busy = true;
    try {
    clearError();
    const from = panel(state.step);
    const next = panel(to);
    renderStep(to);
    state.step = to;
    if (to === 'sum') editing = false;
    updateChrome();
    save();
    if (from !== next) {
      await slide(from, 0, -24 * dir, 150, [1, 0]);
      from.hidden = true;
      next.hidden = false;
      await slide(next, 24 * dir, 0, 200, [0, 1]);
    }
    next.querySelector<HTMLElement>('[data-step-title]')?.focus({ preventScroll: true });
    root.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    } finally {
      // Pase lo que pase en la transición, el formulario no se queda bloqueado.
      busy = false;
    }
  }

  /* ---------- Renderizado dinámico ---------- */
  function renderAdults() {
    adultNamesEl.replaceChildren();
    for (let i = 0; i < state.adults; i++) {
      const id = `rsvp-adult-${i}`;
      const input = el('input', { id, type: 'text', autocomplete: 'off', 'data-adult': String(i) });
      input.value = state.adultNames[i];
      const label = state.adults === 1 ? t.guestNameLabel : fmt(t.adultNameLabel, { n: i + 1 });
      const row = [el('div', { class: 'field' }, el('label', { for: id }, label), input)];
      // Los invitados a partir del segundo se pueden quitar.
      if (i > 0) {
        const rm = el('button', { type: 'button', class: 'guest-remove', 'data-remove': String(i) }, '×');
        rm.setAttribute('aria-label', fmt(t.removeGuest, { n: i + 1 }));
        row[0].classList.add('guest-row');
        row[0].replaceChildren(el('div', {}, el('label', { for: id }, label), input), rm);
      }
      adultNamesEl.append(...row);
    }
    addGuestBtn.hidden = !(state.guest === 'yes' && state.adults >= 1 && state.adults < MAX_ADULTS);
  }

  function block(title: string, goto: StepId, ...lines: (string | Node)[]) {
    const edit = el('button', { type: 'button', class: 'link', 'data-goto': goto }, t.edit);
    edit.setAttribute('aria-label', `${t.edit}: ${title}`);
    return el(
      'section',
      { class: 'sum-block' },
      el('div', { class: 'sum-top' }, el('h4', { class: 'sum-title' }, title), edit),
      el('ul', { class: 'sum-lines' }, ...lines.map((l) => el('li', {}, l))),
    );
  }

  function renderSummary() {
    summaryEl.replaceChildren();
    const attendingText = state.attending === 'yes' ? t.yes : t.no;
    summaryEl.append(block(t.sumYou, 's1', state.name.trim(), state.contacto.trim(), attendingText));
    if (state.attending !== 'yes') return;

    const names = state.adultNames.slice(0, state.adults).map((_, i) => personName(i + 1));
    summaryEl.append(block(t.sumCompanions, 's2', ...(names.length ? names : [t.sumAlone])));
  }

  /* ---------- Validación ---------- */
  const isPhone = (v: string) => /^[+()\d\s.\-]+$/.test(v) && v.replace(/\D/g, '').length >= 7;

  function validate(id: StepId): { msg: string; field: HTMLElement } | null {
    if (id === 's1') {
      if (state.name.trim().length < 2) return { msg: t.errName, field: nameInput };
      const c = state.contacto.trim();
      if (!c) return { msg: t.errContact, field: contactInput };
      if (!isPhone(c)) return { msg: t.errContactInvalid, field: contactInput };
      if (!state.attending) return { msg: t.errAttending, field: q('input[name="attending"]') };
    }
    if (id === 's2') {
      if (!state.guest) return { msg: t.errGuest, field: q('input[name="guest"]') };
      for (let i = 0; i < state.adults; i++) {
        if (state.adultNames[i].trim().length < 2) {
          return { msg: fmt(t.errAdultName, { n: i + 1 }), field: root.querySelector<HTMLElement>(`#rsvp-adult-${i}`)! };
        }
      }
    }
    return null;
  }

  function showError(msg: string, field?: HTMLElement) {
    errorEl.textContent = msg;
    root.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
    if (field instanceof HTMLInputElement && (field.type === 'text' || field.type === 'tel')) field.setAttribute('aria-invalid', 'true');
    field?.focus();
  }

  function clearError() {
    errorEl.textContent = '';
    root.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
  }

  /* ---------- Envío ---------- */
  function buildPayload() {
    const yes = state.attending === 'yes';
    const n = yes ? state.adults : 0;
    return {
      id: crypto.randomUUID() as string,
      idioma: cfg.lang,
      nombre: state.name.trim(),
      telefono: state.contacto.trim(),
      asiste: yes ? 'si' : 'no',
      invitados: n,
      nombres_invitados: state.adultNames.slice(0, n).map((_, i) => personName(i + 1)).join(', '),
      website: hp.value,
      enviado: new Date().toISOString(),
    };
  }

  // El id se genera una vez por intento completo, para que un reintento no duplique la fila.
  let pendingId: string | null = null;

  async function send(payload: ReturnType<typeof buildPayload>) {
    if (!cfg.endpoint) {
      console.info('[rsvp] PUBLIC_RSVP_ENDPOINT vacío: envío simulado.', payload);
      await sleep(900);
      return;
    }
    // Sin cabecera Content-Type: se envía como text/plain, no hay preflight de CORS
    // y Apps Script (que no responde a OPTIONS) lo acepta.
    const res = await fetch(cfg.endpoint, { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    if (data && data.ok === false) throw new Error(String(data.error ?? 'error'));
  }

  // El día se obtiene en hora de Tirana con un locale que todos los navegadores traen (en-GB) y el mes sale de la
  // lista del servidor: así la fecha va siempre en el idioma de la página, aunque el navegador no sepa albanés.
  const formatDay = (iso: string) => {
    const parts = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: cfg.timeZone }).formatToParts(new Date(iso));
    const n = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return fmt(cfg.dateFormat, { d: n('day'), m: cfg.months[n('month') - 1] ?? '', y: n('year') });
  };

  function showDone(yes: boolean) {
    form.hidden = true;
    alreadyEl.hidden = true;
    doneEl.hidden = false;
    const text = q('[data-done-text]');
    text.textContent = yes ? fmt(t.doneYes, { date: cfg.dayMonth }) : t.doneNo;
    doneEl.classList.add('is-in');
    text.focus({ preventScroll: true });
    root.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  function showAlready(sent: { at: string; asiste: string }) {
    form.hidden = true;
    doneEl.hidden = true;
    alreadyEl.hidden = false;
    const text = sent.asiste === 'no' ? t.alreadyNo : t.alreadyYes;
    q('[data-already-text]').textContent = fmt(text, { date: formatDay(sent.at) });
  }

  async function submit() {
    if (busy) return;
    const payload = buildPayload();
    payload.id = pendingId ?? (pendingId = payload.id);
    busy = true;
    nextBtn.disabled = true;
    backBtn.disabled = true;
    nextBtn.textContent = t.sending;
    clearError();
    try {
      if (payload.website.trim()) {
        // Honeypot relleno: parece un bot. Se finge éxito sin enviar nada.
        await sleep(600);
      } else {
        await send(payload);
      }
      store(() => localStorage.setItem(SENT_KEY, JSON.stringify({ at: payload.enviado, asiste: payload.asiste, id: payload.id })));
      // Se conserva lo escrito para poder corregir la respuesta más tarde («Cambiar mi respuesta»).
      pendingId = null;
      showDone(payload.asiste === 'si');
    } catch (err) {
      console.warn('[rsvp] error de envío', err);
      errorEl.textContent = t.sendError; // los datos se conservan
      nextBtn.disabled = false;
      backBtn.disabled = false;
      updateChrome();
      nextBtn.textContent = t.retry;
    } finally {
      busy = false;
    }
  }

  /* ---------- Eventos ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;
    if (state.step === 'sum') return void submit();
    const problem = validate(state.step);
    if (problem) return showError(problem.msg, problem.field);
    const list = steps();
    const next = editing ? 'sum' : list[list.indexOf(state.step) + 1];
    void go(next, 1);
  });

  backBtn.addEventListener('click', () => {
    if (busy) return;
    const list = steps();
    const i = list.indexOf(state.step);
    if (i > 0) {
      editing = false;
      void go(list[i - 1], -1);
    }
  });

  summaryEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-goto]');
    if (!btn) return;
    editing = true;
    void go(btn.dataset.goto as StepId, -1);
  });

  form.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (target === nameInput) state.name = target.value;
    else if (target === contactInput) {
      state.contacto = target.value;
    } else if (target.dataset.adult !== undefined) state.adultNames[Number(target.dataset.adult)] = target.value;
    else return;
    if (target.getAttribute('aria-invalid')) clearError();
    save();
  });

  form.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.name === 'attending') {
      state.attending = target.value as 'yes' | 'no';
      clearError();
      updateChrome();
    } else if (target.name === 'guest') {
      state.guest = target.value as 'yes' | 'no';
      state.adults = state.guest === 'yes' ? Math.max(1, state.adults) : 0;
      clearError();
      renderAdults();
    } else return;
    save();
  });

  // «añadir otro invitado» y quitar un invitado.
  addGuestBtn.addEventListener('click', () => {
    if (state.adults >= MAX_ADULTS) return;
    state.adults += 1;
    renderAdults();
    root.querySelector<HTMLInputElement>(`#rsvp-adult-${state.adults - 1}`)?.focus();
    save();
  });
  adultNamesEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-remove]');
    if (!btn) return;
    const i = Number(btn.dataset.remove);
    state.adultNames.splice(i, 1);
    state.adultNames.push('');
    state.adults -= 1;
    renderAdults();
    save();
  });

  function boot() {
    restore();
    nameInput.value = state.name;
    contactInput.value = state.contacto;
    const radio = (name: string, value: string) => root.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
    if (state.attending) radio('attending', state.attending)!.checked = true;
    if (state.guest) radio('guest', state.guest)!.checked = true;
    renderAdults();

    // Si el progreso guardado apunta a un paso que ya no existe (p. ej. «No viene» → s2), se vuelve al primero.
    if (!steps().includes(state.step)) state.step = 's1';
    renderStep(state.step);
    for (const p of panels) p.hidden = p.dataset.step !== state.step;
    updateChrome();
  }

  // «Cambiar mi respuesta»: se reabre el formulario con lo que ya había escrito, en el resumen.
  const reopen = () => {
    store(() => localStorage.removeItem(SENT_KEY));
    pendingId = null;
    alreadyEl.hidden = true;
    doneEl.hidden = true;
    doneEl.classList.remove('is-in'); // para que el sello vuelva a animarse en el siguiente envío
    form.hidden = false;
    nextBtn.disabled = false;
    backBtn.disabled = false;
    boot();
    if (state.name && state.contacto && state.attending) {
      const target: StepId = 'sum';
      renderStep(target);
      state.step = target;
      for (const p of panels) p.hidden = p.dataset.step !== target;
      updateChrome();
    }
    form.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  };
  // El mismo botón está en «Ya respondiste» (tras recargar) y en la pantalla de confirmación (nada más enviar).
  root.querySelectorAll('[data-change]').forEach((btn) => btn.addEventListener('click', reopen));

  /* ---------- Arranque ---------- */
  const sentRaw = store(() => localStorage.getItem(SENT_KEY));
  if (sentRaw) {
    let sent = { at: '', asiste: 'si' };
    try {
      const parsed = JSON.parse(sentRaw);
      sent = typeof parsed === 'object' && parsed ? parsed : { at: String(parsed), asiste: 'si' };
    } catch {
      sent = { at: sentRaw, asiste: 'si' };
    }
    if (!Number.isNaN(Date.parse(sent.at))) return showAlready(sent);
  }

  boot();

}

const root = document.querySelector<HTMLElement>('[data-rsvp]');
if (root) setup(root);
