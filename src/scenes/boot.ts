/**
 * Tiny helpers for the page script (src/scripts/page.ts). No three.js here:
 * the page script stays small. The scene modules (and the three chunk they
 * share) are imported only when a canvas nears the viewport.
 */

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Renderer strings of CPU rasterizers: SwiftShader (Chrome), llvmpipe and softpipe (Mesa), the Windows basic driver. */
const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * True when the browser can give us a hardware WebGL context. A software
 * rasterizer draws these scenes at a few frames a second while pinning a
 * CPU core, so it counts as no WebGL and the static drawings stay. That is
 * also what headless Chrome without a GPU (CI, Lighthouse) gets.
 */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !SOFTWARE_GL.test(renderer);
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
