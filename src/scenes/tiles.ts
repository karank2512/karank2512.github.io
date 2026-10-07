/**
 * Role tiles under Experience and Leadership: the small window beside each
 * entry drifts on slow sines, tilts toward the pointer while it is near, and
 * lifts on hover. Plain CSS transforms on the inner element, so the scene
 * inside (or its static drawing) rides along; no three.js here, and this
 * runs with or without WebGL. Not mounted under reduced motion. Each tile
 * draws only while on screen and the tab is visible.
 */
export interface TileHandle {
  dispose(): void;
}

const pointer = { x: -1e4, y: -1e4 };
let users = 0;
let seq = 0;
const onMove = (e: PointerEvent): void => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
};
const onLeave = (): void => {
  pointer.x = -1e4;
  pointer.y = -1e4;
};
const clamp1 = (n: number): number => Math.max(-1, Math.min(1, n));
const smooth = (n: number): number => {
  const t = n < 0 ? 0 : n > 1 ? 1 : n;
  return t * t * (3 - 2 * t);
};

export function mountTile(tile: HTMLElement): TileHandle {
  const inner = tile.firstElementChild as HTMLElement | null;
  if (!inner) return { dispose() {} };
  if (users++ === 0) {
    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }
  const phase = seq++ * 1.7;
  let tx = 0;
  let ty = 0;
  let lift = 0;
  let liftTarget = 0;
  let raf = 0;
  let last = 0;
  let running = false;
  let onScreen = false;

  const up = (): void => {
    liftTarget = 1;
    tile.classList.add('up');
  };
  const down = (): void => {
    liftTarget = 0;
    tile.classList.remove('up');
  };
  tile.addEventListener('pointerenter', up);
  tile.addEventListener('pointerleave', down);

  function frame(now: number): void {
    if (!running) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = now / 1000;
    const r = tile.getBoundingClientRect();
    // tilt toward the pointer: full inside the tile, fading out one tile's
    // width beyond its edge, the edge nearest the pointer coming forward
    const dx = (pointer.x - (r.left + r.width / 2)) / r.width;
    const dy = (pointer.y - (r.top + r.height / 2)) / r.height;
    const reach = 1 - smooth(Math.max(Math.abs(dx), Math.abs(dy)) - 0.5);
    const gx = clamp1(dy * 2) * 8 * reach;
    const gy = -clamp1(dx * 2) * 8 * reach;
    const k = 1 - Math.exp(-6 * dt);
    tx += (gx - tx) * k;
    ty += (gy - ty) * k;
    lift += (liftTarget - lift) * (1 - Math.exp(-9 * dt));
    const x = Math.sin(t * 0.5 + phase) * 4;
    const y = Math.sin(t * 0.37 + phase * 1.3) * 3;
    inner.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(lift * 28).toFixed(1)}px) rotateX(${tx.toFixed(2)}deg) rotateY(${ty.toFixed(2)}deg)`;
    raf = requestAnimationFrame(frame);
  }

  function sync(): void {
    const want = onScreen && !document.hidden;
    if (want && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!want && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      sync();
    },
    { rootMargin: '80px' },
  );
  io.observe(tile);
  document.addEventListener('visibilitychange', sync);

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      tile.removeEventListener('pointerenter', up);
      tile.removeEventListener('pointerleave', down);
      if (--users === 0) {
        document.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
      }
    },
  };
}
