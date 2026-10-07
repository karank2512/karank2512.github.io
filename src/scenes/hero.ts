/**
 * Hero scene: a live LLM session as a lattice of KV cache blocks that forks
 * into four branches. Drag sideways or scroll to fork; drag to orbit within
 * limits with inertia on release; the pointer adds a little parallax.
 * Reduced motion renders the forked, settled state once and never loops.
 */
import * as THREE from 'three';
import {
  columns,
  blockAt,
  bounds,
  BLOCKS,
  PER_COL,
  LAYERS,
  KV,
  STEP,
  SIZE,
  FORK_X,
  TRUNK,
} from './lattice';
import { Blocks, Loop, PALETTE, addLights, damp, disposeTree, fitDistance, frameCamera, makeRenderer, ring, type Handle } from './gl';

export interface HeroOptions {
  canvas: HTMLCanvasElement;
  /** Sized box the canvas fills; also the pointer target. */
  stage: HTMLElement;
  /** Optional HTML control; aria-pressed="true" holds the fork open. */
  forkButton: HTMLButtonElement | null;
  reduced: boolean;
  onFirstFrame: () => void;
}

const YAW_MAX = 0.7;
const PITCH_MAX = 0.38;

export function mountHero(o: HeroOptions): Handle {
  const renderer = makeRenderer(o.canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  addLights(scene);

  const rig = new THREE.Group();
  const lattice = new THREE.Group();
  rig.add(lattice);
  scene.add(rig);

  const blocks = new Blocks(BLOCKS, SIZE, PALETTE.ink);
  lattice.add(blocks.group);

  const forkRing = ring(((LAYERS - 1) / 2) * STEP + SIZE * 1.4, 'x', PALETTE.ember);
  forkRing.position.set(FORK_X, 0, 0);
  lattice.add(forkRing);

  // centre the object across the whole fork range and measure it
  const b = bounds();
  const cx = (b.min.x + b.max.x) / 2;
  const cy = (b.min.y + b.max.y) / 2;
  const cz = (b.min.z + b.max.z) / 2;
  lattice.position.set(-cx, -cy, -cz);
  const halfX = (b.max.x - b.min.x) / 2 + SIZE;
  const halfY = (b.max.y - b.min.y) / 2 + SIZE;
  const halfZ = (b.max.z - b.min.z) / 2 + SIZE;
  const rh = Math.hypot(halfX, halfZ);
  const rv = halfY + 0.4 * halfZ;

  const colors = {
    trunk: new THREE.Color(PALETTE.bone2),
    copy: new THREE.Color(PALETTE.sage),
    tip: new THREE.Color(PALETTE.ember),
  };

  // state
  let f = o.reduced ? 1 : 0;
  let fv = 0;
  let dragFork = 0;
  let yaw = 0.18;
  let pitch = 0.12;
  let yawV = 0;
  let pitchV = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let px = 0;
  let py = 0;
  let sx = 0;
  let sy = 0;
  let pointerIn = false;
  let first = true;

  const m = new THREE.Matrix4();
  const vt = new THREE.Vector3();
  const vu = new THREE.Vector3();
  const vs = new THREE.Vector3();
  const vp = new THREE.Vector3();
  const vscale = new THREE.Vector3();

  const softClamp = (v: number, max: number): number => {
    if (v > max) return max + (v - max) * 0.25;
    if (v < -max) return -max + (v + max) * 0.25;
    return v;
  };

  function layout(fork: number, t: number, head: number): void {
    const cols = columns(fork, t);
    for (let ci = 0; ci < cols.length; ci++) {
      const col = cols[ci];
      if (!col) continue;
      const s = Math.max(col.scale, 0.001);
      vt.set(col.t.x, col.t.y, col.t.z);
      vu.set(col.u.x, col.u.y, col.u.z);
      vs.set(col.s.x, col.s.y, col.s.z);
      const color =
        col.kind === 'trunk' ? (col.index === head ? colors.tip : colors.trunk) : col.kind === 'tip' ? colors.tip : colors.copy;
      for (let l = 0; l < LAYERS; l++) {
        for (let k = 0; k < KV; k++) {
          const i = ci * PER_COL + l * KV + k;
          const p = blockAt(col, l, k);
          vp.set(p.x, p.y, p.z);
          m.makeBasis(vt, vu, vs);
          m.scale(vscale.set(s, s, s));
          m.setPosition(vp);
          blocks.set(i, m);
          blocks.color(i, color);
        }
      }
    }
    blocks.commit();
  }

  function render(): void {
    renderer.render(scene, camera);
    if (first) {
      first = false;
      o.onFirstFrame();
    }
  }

  let shift = 1;
  function resize(): void {
    const w = Math.max(1, o.stage.clientWidth);
    const h = Math.max(1, o.stage.clientHeight);
    shift = w > 820 ? 1.45 : 1;
    frameCamera(renderer, camera, w, h, shift);
    camera.position.z = fitDistance(camera, rh, rv, shift, 0.5);
    camera.lookAt(0, 0, 0);
    if (o.reduced) {
      layout(1, 0, TRUNK - 1);
      render();
    }
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(o.stage);
  resize();

  if (o.reduced) {
    rig.rotation.set(pitch, yaw, 0);
    layout(1, 0, TRUNK - 1);
    render();
    return {
      dispose() {
        ro.disconnect();
        blocks.dispose();
        disposeTree(scene);
        renderer.dispose();
      },
    };
  }

  // pointer: drag to orbit and fork, hover for parallax
  const stage = o.stage;
  const rel = (e: PointerEvent): { x: number; y: number } => {
    const r = stage.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
  };
  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;
    yawV = 0;
    pitchV = 0;
    stage.classList.add('dragging');
    try {
      stage.setPointerCapture(e.pointerId);
    } catch {
      /* capture is optional */
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (dragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(1, e.timeStamp - lastT) / 1000;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      const w = Math.max(1, stage.clientWidth);
      yaw = softClamp(yaw + (dx / w) * 2.4, YAW_MAX);
      pitch = softClamp(pitch + (dy / w) * 1.6, PITCH_MAX);
      yawV = ((dx / w) * 2.4) / dt;
      pitchV = ((dy / w) * 1.6) / dt;
      dragFork = Math.min(1, dragFork + Math.abs(dx) / (w * 0.35));
    } else {
      const p = rel(e);
      pointerIn = p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1;
      if (pointerIn) {
        px = p.x;
        py = p.y;
      }
    }
  };
  const onUp = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    try {
      stage.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    // inertia only for a quick release
    const cap = 3;
    yawV = Math.max(-cap, Math.min(cap, yawV));
    pitchV = Math.max(-cap, Math.min(cap, pitchV));
  };
  const onLeave = (): void => {
    pointerIn = false;
  };
  const root = document.documentElement;
  stage.addEventListener('pointerdown', onDown);
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
  root.addEventListener('pointerleave', onLeave);

  const loop = new Loop(stage, (dt, t) => {
    const scrollFork = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)));
    const held = o.forkButton?.getAttribute('aria-pressed') === 'true' ? 1 : 0;
    const target = Math.max(scrollFork, dragFork, held);
    // damped spring: flies apart, overshoots a touch, settles
    fv += (target - f) * 26 * dt - fv * 7.5 * dt;
    f += fv * dt;
    if (f < -0.03) {
      f = -0.03;
      fv = 0;
    }
    if (f > 1.06) {
      f = 1.06;
      fv = 0;
    }

    if (!dragging) {
      yaw += yawV * dt;
      pitch += pitchV * dt;
      const k = Math.exp(-3.4 * dt);
      yawV *= k;
      pitchV *= k;
      // ease back inside the limits
      if (yaw > YAW_MAX) yaw += (YAW_MAX - yaw) * damp(dt, 8);
      if (yaw < -YAW_MAX) yaw += (-YAW_MAX - yaw) * damp(dt, 8);
      if (pitch > PITCH_MAX) pitch += (PITCH_MAX - pitch) * damp(dt, 8);
      if (pitch < -PITCH_MAX) pitch += (-PITCH_MAX - pitch) * damp(dt, 8);
    }
    const tx = pointerIn ? px : 0;
    const ty = pointerIn ? py : 0;
    sx += (tx - sx) * damp(dt, 5);
    sy += (ty - sy) * damp(dt, 5);

    rig.rotation.set(pitch - sy * 0.06, yaw + sx * 0.1, 0);
    rig.position.y = Math.sin(t * 0.8) * 0.06;
    camera.position.x = sx * 0.35;
    camera.position.y = -sy * 0.2;
    camera.lookAt(0, 0, 0);

    // the running session: an ember head steps along the trunk
    const head = Math.floor(t * 3) % TRUNK;
    layout(Math.min(1, Math.max(0, f)), t, head);
    render();
  });

  return {
    dispose() {
      loop.dispose();
      ro.disconnect();
      stage.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      root.removeEventListener('pointerleave', onLeave);
      blocks.dispose();
      disposeTree(scene);
      renderer.dispose();
    },
  };
}
