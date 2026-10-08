/**
 * Build-time isometric drawing of the forked lattice. Used by the static SVG
 * that renders before three.js loads, when WebGL is unavailable, and in the
 * OG image. Hairline wireframe only: one tall box per token column with the
 * layer rows ticked on the front face.
 */
import { columns, add, mul, LAYERS, KV, STEP, SIZE, KV_GAP, FORK_X, type V3, type Kind } from './lattice';

const SCALE = 58;
const PAD = 14;

function iso(p: V3): { x: number; y: number } {
  return { x: (p.x - p.z) * 0.866, y: (p.x + p.z) * 0.5 - p.y };
}

const r1 = (n: number): string => (Math.round(n * 10) / 10).toString();

export interface IsoPath {
  d: string;
  kind: Kind;
}

export interface IsoDrawing {
  paths: IsoPath[];
  /** Path data for the ember ring at the fork point. */
  ring: string;
  viewBox: string;
}

export function latticeSvg(): IsoDrawing {
  const byKind = new Map<Kind, string[]>();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const seg = (a: V3, b: V3, out: string[]): void => {
    const A = iso(a);
    const B = iso(b);
    for (const q of [A, B]) {
      minX = Math.min(minX, q.x);
      minY = Math.min(minY, q.y);
      maxX = Math.max(maxX, q.x);
      maxY = Math.max(maxY, q.y);
    }
    out.push(`M${r1(A.x * SCALE)} ${r1(A.y * SCALE)}L${r1(B.x * SCALE)} ${r1(B.y * SCALE)}`);
  };

  const halfT = SIZE / 2;
  const halfU = ((LAYERS - 1) / 2) * STEP + SIZE / 2;
  const halfS = ((KV - 1) / 2) * KV_GAP + SIZE / 2;

  for (const col of columns(1)) {
    if (col.scale < 0.5) continue;
    const list = byKind.get(col.kind) ?? [];
    byKind.set(col.kind, list);
    const corner = (st: number, su: number, ss: number): V3 =>
      add(add(add(col.p, mul(col.t, st * halfT)), mul(col.u, su * halfU)), mul(col.s, ss * halfS));
    const c = [
      corner(-1, -1, -1),
      corner(1, -1, -1),
      corner(1, 1, -1),
      corner(-1, 1, -1),
      corner(-1, -1, 1),
      corner(1, -1, 1),
      corner(1, 1, 1),
      corner(-1, 1, 1),
    ];
    const edges = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];
    for (let e = 0; e < edges.length; e += 2) {
      const a = c[edges[e] ?? 0];
      const b = c[edges[e + 1] ?? 0];
      if (a && b) seg(a, b, list);
    }
    // layer rows on the front (+s) face
    for (let l = 1; l < LAYERS; l++) {
      const y = ((l - 0.5 - (LAYERS - 1) / 2) * STEP) / halfU;
      seg(corner(-1, y, 1), corner(1, y, 1), list);
    }
  }

  // the fork ring: a circle in the plane of the fork point, projected
  const rr = halfU * 1.15;
  const ringPts: string[] = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const q = iso({ x: FORK_X, y: Math.cos(a) * rr, z: Math.sin(a) * rr });
    ringPts.push(`${i === 0 ? 'M' : 'L'}${r1(q.x * SCALE)} ${r1(q.y * SCALE)}`);
  }

  const w = (maxX - minX) * SCALE + PAD * 2;
  const h = (maxY - minY) * SCALE + PAD * 2;

  const paths: IsoPath[] = [];
  for (const [kind, list] of byKind) {
    paths.push({ kind, d: list.join('') });
  }
  return {
    paths,
    ring: ringPts.join(''),
    viewBox: `${r1(minX * SCALE - PAD)} ${r1(minY * SCALE - PAD)} ${r1(w)} ${r1(h)}`,
  };
}
