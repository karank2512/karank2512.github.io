/**
 * RelayIQ: the gate. Leads (small blocks) stream in along a lane toward a
 * decision plane. At the plane each one is decided: passed leads turn sage
 * and go on into the CRM stack on the right, dropped ones fall away under
 * the lane, held ones step aside into a tray, wait, and are re-decided.
 * Every position is a pure function of time, so the still frame under
 * reduced motion is just one instant of the same stream.
 */
import * as THREE from 'three';
import { Blocks, PALETTE, Stage, floorRect, hash, polyline, put, smoothstep, type Handle, type SceneOptions } from './gl';

const SLOTS = 16;
/**
 * One lead per slot every PERIOD seconds, slots offset by GAP, so a lead
 * leaves every GAP seconds. PERIOD is longer than the longest life (a held
 * lead, about 7.1 s), so a slot is always free when its next lead spawns.
 */
const PERIOD = 8;
const GAP = PERIOD / SLOTS;
const V = 1.3;
const X0 = -3.4;
const PLANE = 0;
const STACK_FACE = 2.1;
const T_PLANE = (PLANE - X0) / V;
const TRAY_Z = 1.1;

type Fate = 'pass' | 'drop' | 'hold';

const fateOf = (n: number): Fate => {
  const r = hash(n);
  return r < 0.5 ? 'pass' : r < 0.8 ? 'drop' : 'hold';
};

interface Pose {
  x: number;
  y: number;
  z: number;
  s: number;
  c: 'bone2' | 'sage' | 'mute';
  /** True during the short merge into the stack. */
  merging: boolean;
}

/** Where lead n (its global occurrence number) is at age a seconds after spawn. */
function pose(n: number, a: number, out: Pose): void {
  const fate = fateOf(n);
  const bob = Math.sin(a * 5 + n) * 0.025;
  out.s = 1;
  out.c = 'bone2';
  out.z = 0;
  out.merging = false;
  if (a < 0) {
    out.s = 0;
    return;
  }
  // in: along the lane up to the plane, growing in over the first 0.3 s
  if (a <= T_PLANE) {
    out.x = X0 + V * a;
    out.y = bob;
    out.s = smoothstep(a / 0.3);
    return;
  }
  const b = a - T_PLANE;
  if (fate === 'pass') {
    passPose(b, bob, out);
    return;
  }
  if (fate === 'drop') {
    out.c = 'mute';
    out.x = PLANE + V * 0.5 * b;
    out.y = -4 * b * b;
    out.s = out.y < -0.8 ? Math.max(0, 1 - (-0.8 - out.y) / 0.6) : 1;
    if (out.y < -1.5) out.s = 0;
    return;
  }
  // hold: step into the tray, wait, come back to the lane, then pass
  const slot = n % 3;
  const tx = 0.75 + slot * 0.32;
  if (b < 0.8) {
    const q = smoothstep(b / 0.8);
    out.x = PLANE + (tx - PLANE) * q;
    out.z = TRAY_Z * q;
    out.y = bob + Math.sin(q * Math.PI) * 0.15;
    return;
  }
  if (b < 3.0) {
    out.x = tx;
    out.z = TRAY_Z;
    out.y = bob;
    return;
  }
  if (b < 3.6) {
    const q = smoothstep((b - 3.0) / 0.6);
    out.x = tx + (1.4 - tx) * q;
    out.z = TRAY_Z * (1 - q);
    out.y = bob + Math.sin(q * Math.PI) * 0.15;
    out.c = 'sage';
    return;
  }
  passPose(b - 3.6 + (1.4 - PLANE) / V, bob, out);
}

/** After the plane, a passed lead runs to the stack face and merges into it. */
function passPose(b: number, bob: number, out: Pose): void {
  out.c = 'sage';
  const tFace = (STACK_FACE - PLANE) / V;
  if (b <= tFace) {
    out.x = PLANE + V * b;
    out.y = bob;
    return;
  }
  const m = b - tFace;
  out.x = STACK_FACE + m * 0.3;
  out.y = bob * (1 - m / 0.3);
  out.s = Math.max(0, 1 - m / 0.3);
  out.merging = m < 0.35;
}

export function mount(o: SceneOptions): Handle {
  const stage = new Stage(o, { rh: 3.4, rv: 1.3, yaw: 0.55, pitch: 0.38, target: new THREE.Vector3(-0.4, -0.15, 0.1) }, 11.3);
  const root = stage.root;

  const colors = {
    bone2: new THREE.Color(PALETTE.bone2),
    sage: new THREE.Color(PALETTE.sage),
    mute: new THREE.Color(PALETTE.mute),
    ink2: new THREE.Color(PALETTE.ink2),
  };

  // the lane, the tray and the plane
  root.add(polyline([new THREE.Vector3(X0, -0.12, 0), new THREE.Vector3(STACK_FACE, -0.12, 0)], PALETTE.line));
  root.add(floorRect(0.55, TRAY_Z - 0.25, 1.65, TRAY_Z + 0.25, -0.12, PALETTE.line));
  const plane = new Blocks(1, new THREE.Vector3(0.04, 1.2, 1.0), PALETTE.ember);
  put(plane, 0, PLANE, 0.2, 0, colors.ink2);
  plane.commit();
  root.add(plane.group);

  // the CRM stack: six slabs; the top one flashes sage as a lead merges
  const SLABS = 6;
  const stack = new Blocks(SLABS, new THREE.Vector3(1.0, 0.14, 0.8), PALETTE.ink);
  for (let i = 0; i < SLABS; i++) put(stack, i, 2.6, -0.45 + i * 0.2, 0, colors.bone2);
  stack.commit();
  root.add(stack.group);

  // the leads
  const leads = new Blocks(SLOTS, 0.22, PALETTE.ink);
  root.add(leads.group);

  const p: Pose = { x: 0, y: 0, z: 0, s: 0, c: 'bone2', merging: false };

  stage.run((_dt, t) => {
    let merging = false;
    for (let i = 0; i < SLOTS; i++) {
      // occurrence j of slot i spawned at i * GAP + j * PERIOD
      const since = t - i * GAP;
      const j = Math.floor(since / PERIOD);
      const age = since - j * PERIOD;
      pose(i + j * SLOTS, age, p);
      merging = merging || p.merging;
      put(leads, i, p.x, p.y, p.z, colors[p.c], Math.max(0.0001, p.s));
    }
    leads.commit();
    stack.color(SLABS - 1, merging ? colors.sage : colors.bone2);
    stack.commit();
    root.rotation.y = Math.sin(t * 0.3) * 0.04;
  });

  return {
    dispose() {
      stage.dispose([plane, stack, leads]);
    },
  };
}
