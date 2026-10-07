/**
 * Geometry of the hero object: a KV cache drawn as a lattice of small blocks
 * (tokens along the run, layers stacked, keys and values side by side) that
 * forks into four branches. Pure math with no three.js import, so the static
 * SVG fallback can use it at build time and the WebGL scene at runtime.
 *
 * Units are scene units. Columns are token positions; each column holds
 * LAYERS x KV blocks. A fork progress f in [0, 1] bends the four branch
 * curves from "straight ahead" (one session) to their fanned-out targets.
 */
export interface V3 {
  x: number;
  y: number;
  z: number;
}

/** Token columns in the shared prefix (the running session). */
export const TRUNK = 10;
/** Token columns per fork. */
export const BRANCH = 8;
/** Of those, how many are copied KV cache; the rest are new tokens. */
export const COPIED = 4;
export const LAYERS = 6;
export const KV = 2;
/** Spacing between block centres. */
export const STEP = 0.36;
/** Block edge length. */
export const SIZE = 0.26;
export const FORKS = 4;
export const PER_COL = LAYERS * KV;
export const COLS = TRUNK + FORKS * BRANCH;
export const BLOCKS = COLS * PER_COL;
/** Keys and values sit a little further apart than layers do. */
export const KV_GAP = STEP * 1.15;

const X: V3 = { x: 1, y: 0, z: 0 };
const UP: V3 = { x: 0, y: 1, z: 0 };

export const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const mul = (a: V3, k: number): V3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
export const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross = (a: V3, b: V3): V3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
export function norm(a: V3): V3 {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}
export const lerp3 = (a: V3, b: V3, t: number): V3 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number): number => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Where each fork ends up, as a unit direction from the fork point. */
export const DIRS: V3[] = [
  { x: 0.72, y: 0.55, z: -0.42 },
  { x: 0.72, y: 0.18, z: 0.67 },
  { x: 0.72, y: -0.22, z: -0.66 },
  { x: 0.72, y: -0.58, z: 0.38 },
].map(norm);

export const BRANCH_LEN = BRANCH * STEP;
/** The fork point sits half a step past the last trunk column. */
export const FORK_X = (TRUNK - 0.5) * STEP;

export type Kind = 'trunk' | 'copy' | 'new' | 'tip';

export interface Column {
  /** Centre of the column. */
  p: V3;
  /** Local frame: t along the run, u up through the layers, s across K and V. */
  t: V3;
  u: V3;
  s: V3;
  /** 0 hides the column; new tokens grow in as the fork settles. */
  scale: number;
  kind: Kind;
  /** -1 for the trunk, else the fork index. */
  fork: number;
  /** Token index within the trunk or the branch. */
  index: number;
}

function frame(p: V3, t0: V3, scale: number, kind: Kind, fork: number, index: number): Column {
  const t = norm(t0);
  const s = norm(cross(t, UP));
  const u = cross(s, t);
  return { p, t, u, s, scale, kind, fork, index };
}

/** Per-fork progress: forks leave one after another and ease out. */
export function forkProgress(f: number, k: number): number {
  return smooth((f - k * 0.06) / 0.82);
}

/**
 * All column frames for a fork progress f. `time` adds a small idle drift to
 * the settled branch ends; pass 0 for a still frame.
 */
export function columns(f: number, time = 0): Column[] {
  const out: Column[] = [];
  for (let i = 0; i < TRUNK; i++) {
    out.push(frame({ x: i * STEP, y: 0, z: 0 }, X, 1, 'trunk', -1, i));
  }
  const S: V3 = { x: FORK_X, y: 0, z: 0 };
  for (let k = 0; k < FORKS; k++) {
    const fk = forkProgress(f, k);
    const dir = lerp3(X, DIRS[k] ?? X, fk);
    const wobble: V3 =
      time === 0
        ? { x: 0, y: 0, z: 0 }
        : {
            x: 0,
            y: Math.sin(time * 0.9 + k * 1.7) * 0.05 * fk,
            z: Math.cos(time * 0.7 + k * 2.1) * 0.05 * fk,
          };
    const E = add(add(S, mul(dir, BRANCH_LEN)), wobble);
    const C = add(S, mul(X, BRANCH_LEN * 0.45));
    for (let j = 0; j < BRANCH; j++) {
      const u = (j + 0.5) / BRANCH;
      const a = (1 - u) * (1 - u);
      const b = 2 * (1 - u) * u;
      const c = u * u;
      const p: V3 = {
        x: a * S.x + b * C.x + c * E.x,
        y: a * S.y + b * C.y + c * E.y,
        z: a * S.z + b * C.z + c * E.z,
      };
      const tangent = add(mul(sub(C, S), 2 * (1 - u)), mul(sub(E, C), 2 * u));
      const isNew = j >= COPIED;
      const scale = isNew ? smooth((fk - (0.3 + (j - COPIED) * 0.14)) / 0.22) : 1;
      const kind: Kind = !isNew ? 'copy' : j === BRANCH - 1 ? 'tip' : 'new';
      out.push(frame(p, tangent, scale, kind, k, j));
    }
  }
  return out;
}

/** Centre of block (layer l, kv m) in a column. */
export function blockAt(col: Column, l: number, m: number): V3 {
  const oy = (l - (LAYERS - 1) / 2) * STEP;
  const oz = (m - (KV - 1) / 2) * KV_GAP;
  return add(add(col.p, mul(col.u, oy)), mul(col.s, oz));
}

export interface Bounds {
  min: V3;
  max: V3;
}

/** Bounding box of every block centre across the whole fork range. */
export function bounds(): Bounds {
  const min: V3 = { x: Infinity, y: Infinity, z: Infinity };
  const max: V3 = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (const f of [0, 0.5, 1]) {
    for (const col of columns(f)) {
      for (let l = 0; l < LAYERS; l++) {
        for (let m = 0; m < KV; m++) {
          const p = blockAt(col, l, m);
          min.x = Math.min(min.x, p.x);
          min.y = Math.min(min.y, p.y);
          min.z = Math.min(min.z, p.z);
          max.x = Math.max(max.x, p.x);
          max.y = Math.max(max.y, p.y);
          max.z = Math.max(max.z, p.z);
        }
      }
    }
  }
  return { min, max };
}
