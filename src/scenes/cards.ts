/**
 * Project cards floating in perspective. The cards are plain HTML (so the
 * text is crisp, AA-contrast and keyboard reachable); this module moves them
 * in a CSS 3D space that matches the camera in cardsGl.ts exactly. Cards
 * drift, tilt toward the pointer, and lift on hover or focus.
 */
export interface CardState {
  el: HTMLElement;
  x: number;
  y: number;
  z: number;
  /** degrees, CSS rotateX / rotateY */
  rx: number;
  ry: number;
  lift: number;
  liftTarget: number;
  tx: number;
  ty: number;
  phase: number;
}

export interface Slot {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
}

export interface Layout {
  slots: Slot[];
  cw: number;
  ch: number;
  height: number;
}

export interface DeckState {
  deck: HTMLElement;
  cards: CardState[];
  layout: Layout;
  /** CSS perspective distance in px; the WebGL camera sits here. */
  perspective: number;
  pointer: { x: number; y: number; inside: boolean };
  reduced: boolean;
  frame: Set<(dt: number, t: number) => void>;
  resize: Set<(l: Layout) => void>;
  dispose(): void;
}

export const PERSPECTIVE = 1200;
const RX = [4, -5, 6, -4];
const RY = [-9, 7, -6, 10];
/** No vertical stagger: the three cards share one baseline, and depth (DZ) and tilt alone make them float. Matches the CSS resting slots. */
const DY = [0, 0, 0, 0];
const DZ = [-40, 20, -60, 30];
/** Card height before the cards are measured; the CSS default for --ch (the tallest card's copy, Foreman, runs to about 580px at 320px wide). */
export const CH_DEFAULT = 600;

/**
 * Resting slots for n cards of height ch in a deck w wide (the deck is the
 * viewport less the gutters, so 800 here is about the 899px CSS breakpoint
 * and 540 about the 599px one): one row, two columns (an odd last card
 * centred), or one column. The slot x/y are offsets from the deck centre.
 */
export function layoutFor(w: number, n: number, ch: number): Layout {
  const slots: Slot[] = [];
  if (w >= 800) {
    const cw = Math.max(250, Math.min(320, (w - 40 * (n - 1)) / n));
    const gap = n > 1 ? Math.min(cw + 140, (w - cw) / (n - 1)) : 0;
    for (let i = 0; i < n; i++) {
      slots.push({ x: (i - (n - 1) / 2) * gap, y: DY[i] ?? 0, z: DZ[i] ?? 0, rx: RX[i] ?? 0, ry: RY[i] ?? 0 });
    }
    return { slots, cw, ch, height: ch + 120 };
  }
  if (w >= 540) {
    const cw = Math.min(320, (w - 40) / 2);
    const rows = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const alone = row === rows - 1 && n % 2 === 1;
      slots.push({
        x: alone ? 0 : (col - 0.5) * (cw + 40),
        y: (row - (rows - 1) / 2) * (ch + 48) + (DY[i] ?? 0) * 0.4,
        z: DZ[i] ?? 0,
        rx: RX[i] ?? 0,
        ry: RY[i] ?? 0,
      });
    }
    return { slots, cw, ch, height: rows * ch + (rows - 1) * 48 + 100 };
  }
  const cw = Math.min(320, w - 24);
  for (let i = 0; i < n; i++) {
    slots.push({ x: i % 2 ? 8 : -8, y: (i - (n - 1) / 2) * (ch + 32), z: DZ[i] ?? 0, rx: (RX[i] ?? 0) * 0.6, ry: (RY[i] ?? 0) * 0.6 });
  }
  return { slots, cw, ch, height: n * ch + (n - 1) * 32 + 80 };
}

export function mountCards(deck: HTMLElement, cardEls: HTMLElement[], reduced: boolean): DeckState {
  const cards: CardState[] = cardEls.map((el, i) => ({
    el,
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    lift: 0,
    liftTarget: 0,
    tx: 0,
    ty: 0,
    phase: i * 1.7,
  }));
  const state: DeckState = {
    deck,
    cards,
    layout: layoutFor(deck.clientWidth, cards.length, CH_DEFAULT),
    perspective: PERSPECTIVE,
    pointer: { x: 0, y: 0, inside: false },
    reduced,
    frame: new Set(),
    resize: new Set(),
    dispose,
  };

  function write(c: CardState): void {
    c.el.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, ${(c.z + c.lift).toFixed(1)}px) rotateX(${(c.rx + c.tx).toFixed(2)}deg) rotateY(${(c.ry + c.ty).toFixed(2)}deg)`;
  }

  /**
   * The tallest card's natural height at the current width, so no card
   * clips its copy. offsetHeight ignores the 3D transform.
   */
  function measure(cw: number): number {
    deck.style.setProperty('--cw', `${cw}px`);
    for (const c of cards) c.el.style.height = 'auto';
    let h = 0;
    for (const c of cards) h = Math.max(h, (c.el.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0);
    for (const c of cards) c.el.style.height = '';
    return Math.max(300, Math.ceil(h) + 2);
  }

  function applyLayout(): void {
    const w = deck.clientWidth;
    const probe = layoutFor(w, cards.length, CH_DEFAULT);
    state.layout = layoutFor(w, cards.length, measure(probe.cw));
    deck.style.setProperty('--cw', `${state.layout.cw}px`);
    deck.style.setProperty('--ch', `${state.layout.ch}px`);
    deck.style.height = `${state.layout.height}px`;
    cards.forEach((c, i) => {
      const s = state.layout.slots[i];
      if (!s) return;
      // the CSS resting rules place slots by left/top per breakpoint; from
      // here on every slot hangs from the deck centre and moves by transform
      c.el.style.left = '50%';
      c.el.style.top = '50%';
      c.x = s.x;
      c.y = s.y;
      c.z = s.z;
      c.rx = s.rx;
      c.ry = s.ry;
      write(c);
    });
    state.resize.forEach((fn) => fn(state.layout));
  }

  const ro = new ResizeObserver(() => applyLayout());
  ro.observe(deck);
  applyLayout();

  const listeners: Array<() => void> = [];
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
    opts?: AddEventListenerOptions,
  ): void => {
    el.addEventListener(type, fn, opts);
    listeners.push(() => el.removeEventListener(type, fn, opts));
  };

  cards.forEach((c) => {
    const up = (): void => {
      c.liftTarget = 1;
    };
    const down = (): void => {
      c.liftTarget = 0;
    };
    on(c.el, 'pointerenter', up);
    on(c.el, 'pointerleave', down);
    on(c.el, 'focusin', up);
    on(c.el, 'focusout', down);
  });

  let raf = 0;
  let last = 0;
  let running = false;
  let onScreen = false;
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      sync();
    },
    { rootMargin: '80px' },
  );
  const onVis = (): void => sync();

  function tick(now: number): void {
    if (!running) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = now / 1000;
    const r = deck.getBoundingClientRect();
    const p = state.pointer;
    cards.forEach((c, i) => {
      const s = state.layout.slots[i];
      if (!s) return;
      // drift
      c.x = s.x + Math.sin(t * 0.5 + c.phase) * 12;
      c.y = s.y + Math.sin(t * 0.37 + c.phase * 1.3) * 9;
      c.z = s.z + Math.sin(t * 0.3 + c.phase * 0.7) * 16;
      // tilt toward the pointer: the edge nearest the pointer comes forward
      let ttx = 0;
      let tty = 0;
      if (p.inside) {
        const cx = r.left + r.width / 2 + c.x;
        const cy = r.top + r.height / 2 + c.y;
        const dx = Math.max(-1, Math.min(1, (p.x - cx) / (r.width / 2)));
        const dy = Math.max(-1, Math.min(1, (p.y - cy) / (r.height / 2)));
        ttx = dy * 10;
        tty = -dx * 10;
      }
      const k = 1 - Math.exp(-6 * dt);
      c.tx += (ttx - c.tx) * k;
      c.ty += (tty - c.ty) * k;
      c.lift += (c.liftTarget * 70 - c.lift) * (1 - Math.exp(-9 * dt));
      write(c);
    });
    state.frame.forEach((fn) => fn(dt, t));
    raf = requestAnimationFrame(tick);
  }

  function sync(): void {
    const want = onScreen && !document.hidden && !reduced;
    if (want && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!want && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  const onMove = (e: PointerEvent): void => {
    const r = deck.getBoundingClientRect();
    state.pointer.x = e.clientX;
    state.pointer.y = e.clientY;
    state.pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  const onLeave = (): void => {
    state.pointer.inside = false;
  };

  if (!reduced) {
    io.observe(deck);
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
  }

  function dispose(): void {
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    listeners.forEach((off) => off());
    document.removeEventListener('visibilitychange', onVis);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
  }

  return state;
}
