/**
 * Tiny helpers shared by the three component scripts. No three.js here: this
 * is part of the page script, which stays small. The scene modules (and the
 * three chunk they share) are imported only when a canvas nears the viewport.
 */

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True when the browser can give us a WebGL context. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Run cb once, the first time el comes within `margin` of the viewport. */
export function near(el: Element, cb: () => void, margin = '320px'): void {
  if (!('IntersectionObserver' in window)) {
    cb();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin: margin },
  );
  io.observe(el);
}

/** Wait for an idle moment so the scene chunk never competes with first paint. */
export function whenIdle(cb: () => void, timeout = 900): void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(cb, { timeout });
  else setTimeout(cb, 200);
}
