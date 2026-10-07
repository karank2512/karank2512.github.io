/**
 * Foreman: the staffing agency. A job spec (a slab with lines on it) waits
 * at intake. Its blocks fly out and assemble into a worker figure, which
 * walks the floor through three approval gates; each gate turns ember as
 * the worker is checked and sage once it is through. The worker leaves on
 * the right, the gates reset and a new spec arrives. One nine second cycle,
 * every position a pure function of time.
 */
import * as THREE from 'three';
import { Blocks, PALETTE, Stage, floorRect, put, smoothstep, type Handle, type SceneOptions } from './gl';

const PERIOD = 9;
const FLOOR = -0.6;
const SPEC_X = -2.6;
const START_X = -1.8;
const GATES = [-0.5, 0.9, 2.3];
const H = 0.16;

/** The figure, as block offsets from its feet: [x, y, part]. Legs and arms swing while walking. */
type Part = 'head' | 'torso' | 'armL' | 'armR' | 'legL' | 'legR';
const FIGURE: Array<[number, number, Part]> = [
  [0, 0.9, 'head'],
  [-0.08, 0.72, 'torso'], [0.08, 0.72, 'torso'],
  [-0.08, 0.56, 'torso'], [0.08, 0.56, 'torso'],
  [-0.08, 0.4, 'torso'], [0.08, 0.4, 'torso'],
  [-0.24, 0.72, 'armL'], [-0.24, 0.56, 'armL'],
  [0.24, 0.72, 'armR'], [0.24, 0.56, 'armR'],
  [-0.08, 0.24, 'legL'], [-0.08, 0.08, 'legL'],
  [0.08, 0.24, 'legR'], [0.08, 0.08, 'legR'],
];

export function mount(o: SceneOptions): Handle {
  const stage = new Stage(o, { rh: 3.5, rv: 1.3, yaw: 0.5, pitch: 0.34, target: new THREE.Vector3(-0.1, 0.05, 0) }, 5.0);
  const root = stage.root;

  const bone2 = new THREE.Color(PALETTE.bone2);
  const sage = new THREE.Color(PALETTE.sage);
  const ember = new THREE.Color(PALETTE.ember);
  const ink2 = new THREE.Color(PALETTE.ink2);
  const gateColor = new THREE.Color();

  // the floor
  root.add(floorRect(-3.4, -1, 3.4, 1, FLOOR, PALETTE.line));

  // the spec: a slab standing at intake with three lines of text on it
  const spec = new Blocks(1, new THREE.Vector3(0.7, 0.5, 0.04), PALETTE.ink);
  const lines = new Blocks(3, new THREE.Vector3(0.42, 0.028, 0.02), PALETTE.ink2);
  root.add(spec.group, lines.group);

  // the worker
  const worker = new Blocks(FIGURE.length, H, PALETTE.ink);
  root.add(worker.group);

  // three gates: two posts and a lintel each
  const posts = new Blocks(GATES.length * 2, new THREE.Vector3(0.08, 1.44, 0.08), PALETTE.ink);
  const lintels = new Blocks(GATES.length, new THREE.Vector3(0.08, 0.08, 0.98), PALETTE.ink);
  root.add(posts.group, lintels.group);

  const specScale = new THREE.Vector3();

  stage.run((_dt, time) => {
    const t = ((time % PERIOD) + PERIOD) % PERIOD;

    // spec: present until the blocks leave, back again at the end of the cycle
    let specS = 1;
    if (t >= 1.2 && t < 2.8) specS = 1 - smoothstep(((t - 1.2) / 1.6 - 0.3) / 0.5);
    else if (t >= 2.8 && t < 8.4) specS = 0;
    else if (t >= 8.4) specS = smoothstep((t - 8.4) / 0.6);
    const specY = 0.0 + Math.sin(time * 1.1) * 0.02;
    specScale.set(specS, specS, Math.max(specS, 0.0001));
    put(spec, 0, SPEC_X, specY, 0, bone2, specScale);
    spec.commit();
    for (let i = 0; i < 3; i++) {
      put(lines, i, SPEC_X - 0.03 * i, specY + 0.12 - i * 0.12, 0.03, ink2, specS);
    }
    lines.commit();

    // worker: assembling, walking, leaving
    let wx = START_X;
    let assemble = 0; // 0 at the spec, 1 in place
    let wscale = 0;
    let gait = 0;
    if (t < 1.2) {
      wscale = 0;
    } else if (t < 2.8) {
      assemble = (t - 1.2) / 1.6;
      wscale = 1;
    } else if (t < 7.8) {
      assemble = 1;
      wscale = 1;
      wx = START_X + (t - 2.8) * 1.0;
      gait = (t - 2.8) * 7;
    } else if (t < 8.4) {
      assemble = 1;
      wx = START_X + 5.0;
      wscale = 1 - smoothstep((t - 7.8) / 0.6);
    }
    const swing = Math.sin(gait) * 0.07;
    FIGURE.forEach(([ox, oy, part], i) => {
      const q = smoothstep((assemble - i * 0.035) / 0.5);
      // walking: legs alternate, arms counter-swing, the body bobs
      let sx = 0;
      if (part === 'legL') sx = swing * (oy < 0.2 ? 1.6 : 1);
      if (part === 'legR') sx = -swing * (oy < 0.2 ? 1.6 : 1);
      if (part === 'armL') sx = -swing * 0.8;
      if (part === 'armR') sx = swing * 0.8;
      const bobY = gait > 0 ? Math.abs(Math.sin(gait)) * 0.02 : 0;
      const tx = wx + ox + sx;
      const ty = FLOOR + oy + bobY;
      const x = SPEC_X + (tx - SPEC_X) * q;
      const y = specY + (ty - specY) * q + Math.sin(q * Math.PI) * 0.35;
      const s = Math.max(0.0001, Math.min(q, 1) * wscale);
      put(worker, i, x, y, 0, part === 'head' ? ember : sage, s);
    });
    worker.commit();

    // gates: checking in ember while the worker is in the gate, sage once through
    GATES.forEach((gx, g) => {
      const dx = wx - gx;
      let tone = 0; // 0 bone2, 1 ember, 2 sage
      if (wscale > 0 && assemble >= 1) {
        if (Math.abs(dx) < 0.3) tone = 1;
        else if (dx >= 0.3) tone = 2;
      }
      if (t >= 7.8) {
        // fade back to rest as the worker leaves
        gateColor.lerpColors(sage, bone2, smoothstep((t - 7.8) / 0.6));
      } else gateColor.copy(tone === 1 ? ember : tone === 2 ? sage : bone2);
      put(posts, g * 2, gx, FLOOR + 0.72, -0.45, gateColor);
      put(posts, g * 2 + 1, gx, FLOOR + 0.72, 0.45, gateColor);
      put(lintels, g, gx, FLOOR + 1.44, 0, gateColor);
    });
    posts.commit();
    lintels.commit();

    root.rotation.y = Math.sin(time * 0.25) * 0.04;
  });

  return {
    dispose() {
      stage.dispose([spec, lines, worker, posts, lintels]);
    },
  };
}
