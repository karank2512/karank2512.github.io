/**
 * tell: the signal field. Public-source events, job posts (flat cards),
 * filings (tall slips) and news (cubes), appear scattered on the left,
 * drift for a while, then converge along curves into a ranked account list
 * on the right: five bars, the top one in ember. A bar nudges wider for a
 * moment as an event lands. Every position is a pure function of time.
 */
import * as THREE from 'three';
import { Blocks, PALETTE, Stage, hash, polyline, put, smoothstep, type Handle, type SceneOptions } from './gl';

const N = 48;
const ROWS = 5;
const WIDTHS = [1.6, 1.3, 1.05, 0.85, 0.7];
const LIST_X = 1.5;
const rowY = (r: number): number => 0.8 - r * 0.4;

/** Which bar event i lands on: the top ranks collect more. */
const rowOf = (i: number): number => {
  const r = hash(i * 3 + 7);
  return r < 0.4 ? 0 : r < 0.65 ? 1 : r < 0.82 ? 2 : r < 0.93 ? 3 : 4;
};

const cycleOf = (i: number): number => 7 + (i % 5) * 0.6;

export function mount(o: SceneOptions): Handle {
  const stage = new Stage(o, { rh: 3.4, rv: 1.4, yaw: 0.35, pitch: 0.3, target: new THREE.Vector3(-0.3, 0, 0) }, 23.0);
  const root = stage.root;

  const bone2 = new THREE.Color(PALETTE.bone2);
  const mute = new THREE.Color(PALETTE.mute);
  const sage = new THREE.Color(PALETTE.sage);
  const ember = new THREE.Color(PALETTE.ember);

  // three shapes, one Blocks set each
  const per = N / 3;
  const posts = new Blocks(per, new THREE.Vector3(0.16, 0.11, 0.02), PALETTE.ink);
  const filings = new Blocks(per, new THREE.Vector3(0.06, 0.2, 0.06), PALETTE.ink);
  const news = new Blocks(per, 0.1, PALETTE.ink);
  const sets = [posts, filings, news];
  const tones = [bone2, mute, sage];
  root.add(posts.group, filings.group, news.group);

  // the ranked list: a rail and five bars
  root.add(polyline([new THREE.Vector3(LIST_X - 0.1, 1.05, 0), new THREE.Vector3(LIST_X - 0.1, -1.05, 0)], PALETTE.line));
  const rows = new Blocks(ROWS, new THREE.Vector3(1, 0.16, 0.6), PALETTE.ink);
  root.add(rows.group);
  const rowScale = new THREE.Vector3();

  // start positions and drift phases, fixed per event
  const start = Array.from({ length: N }, (_, i) => ({
    x: -3.3 + hash(i) * 2.9,
    y: -1.0 + hash(i + 100) * 2.0,
    z: -1.2 + hash(i + 200) * 2.4,
    ph: hash(i + 300) * Math.PI * 2,
    row: rowOf(i),
    off: hash(i + 400) * cycleOf(i),
  }));
  const bump = new Float32Array(ROWS);

  stage.run((_dt, t) => {
    bump.fill(0);
    for (let i = 0; i < N; i++) {
      const s0 = start[i];
      if (!s0) continue;
      const P = cycleOf(i);
      const a = (((t + s0.off) % P) + P) % P;
      // drift around the start point
      const dx = Math.sin(t * 0.4 + s0.ph) * 0.12;
      const dy = Math.sin(t * 0.33 + s0.ph * 1.7) * 0.1;
      const dz = Math.cos(t * 0.37 + s0.ph) * 0.12;
      let x = s0.x + dx;
      let y = s0.y + dy;
      let z = s0.z + dz;
      let s = 1;
      if (a < 0.5) {
        s = smoothstep(a / 0.5);
      } else if (a >= 4 && a < 5.6) {
        // converge: a quadratic curve from the drift point to the bar's left end
        const q = smoothstep((a - 4) / 1.6);
        const ex = LIST_X;
        const ey = rowY(s0.row);
        const ez = 0;
        const cx = (x + ex) / 2;
        const cy = Math.max(y, ey) + 0.6;
        const cz = z * 0.3;
        const u = 1 - q;
        x = u * u * x + 2 * u * q * cx + q * q * ex;
        y = u * u * y + 2 * u * q * cy + q * q * ey;
        z = u * u * z + 2 * u * q * cz + q * q * ez;
      } else if (a >= 5.6 && a < 5.9) {
        x = LIST_X;
        y = rowY(s0.row);
        z = 0;
        s = 1 - (a - 5.6) / 0.3;
        bump[s0.row] = Math.max(bump[s0.row] ?? 0, Math.sin(((a - 5.6) / 0.3) * Math.PI));
      } else if (a >= 5.9) {
        s = 0;
      }
      const k = i % 3;
      const set = sets[k];
      if (set) put(set, Math.floor(i / 3), x, y, z, tones[k] ?? bone2, Math.max(0.0001, s));
    }
    sets.forEach((b) => b.commit());

    for (let r = 0; r < ROWS; r++) {
      const w = (WIDTHS[r] ?? 0.7) * (1 + 0.06 * (bump[r] ?? 0));
      rowScale.set(w, 1, 1);
      put(rows, r, LIST_X + w / 2, rowY(r), 0, r === 0 ? ember : bone2, rowScale);
    }
    rows.commit();

    root.rotation.y = Math.sin(t * 0.22) * 0.04;
  });

  return {
    dispose() {
      stage.dispose([posts, filings, news, rows]);
    },
  };
}
