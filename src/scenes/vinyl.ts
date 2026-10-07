/**
 * The turntable, inside the sound control. A vinyl disc on a plinth with a
 * tonearm parked beside it and a row of equalizer bars at rest. Press play:
 * the arm swings in and lowers, the disc spins up and the bars move. Stop:
 * the arm lifts and parks, the disc spins down, the bars settle. The bars
 * are decoration driven by a clock, nothing here listens to the audio.
 * Under reduced motion each state is one still frame.
 */
import * as THREE from 'three';
import { Blocks, PALETTE, Stage, blockMaterial, damp, floorRect, put, ring, type Handle, type SceneOptions } from './gl';

export interface VinylHandle extends Handle {
  setPlaying(on: boolean): void;
}

export interface VinylOptions extends SceneOptions {
  playing: boolean;
}

const BARS = 7;
const ARM_LEN = 0.95;
const PIVOT = new THREE.Vector3(0.72, 0.03, -0.45);
/** Arm yaw: parked just off the rim, lead-in on the outer groove, run-out at the label. */
const YAW_PARKED = -0.3;
const YAW_LEAD_IN = -0.1;
const YAW_RUN_OUT = 0.33;
const LIFT_UP = -0.12;
const RPM = 3.49; // 33 and a third a minute, in radians a second
/** How long the arm takes to cross the record, so it tracks inward slowly. */
const SIDE = 90;

export function mountVinyl(o: VinylOptions): VinylHandle {
  const stage = new Stage(o, { rh: 1.75, rv: 0.7, yaw: -0.35, pitch: 0.58, target: new THREE.Vector3(0.9, 0.05, 0) }, 0);
  const root = stage.root;

  const bone2 = new THREE.Color(PALETTE.bone2);
  const ink2 = new THREE.Color(PALETTE.ink2);
  const sage = new THREE.Color(PALETTE.sage);
  const ember = new THREE.Color(PALETTE.ember);

  // plinth, and a hairline footprint under the bars
  const plinth = new Blocks(1, new THREE.Vector3(2.2, 0.16, 1.7), PALETTE.ink);
  put(plinth, 0, 0.3, -0.08, 0, ink2);
  plinth.commit();
  root.add(plinth.group);
  root.add(floorRect(1.48, -0.25, 2.62, 0.25, 0, PALETTE.line));

  // the disc: a flat cylinder with rim hairlines, grooves and an ember label
  const disc = new THREE.Group();
  disc.position.set(0, 0.03, 0);
  root.add(disc);
  const discGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.06, 48);
  const discMat = blockMaterial();
  discMat.color.set(PALETTE.ink);
  disc.add(new THREE.Mesh(discGeo, discMat));
  const rimTop = ring(0.62, 'y', PALETTE.bone2, 48);
  rimTop.position.y = 0.031;
  const rimBottom = ring(0.62, 'y', PALETTE.bone2, 48);
  rimBottom.position.y = -0.031;
  disc.add(rimTop, rimBottom);
  for (const r of [0.54, 0.46, 0.38, 0.3]) {
    const g = ring(r, 'y', PALETTE.line2, 48);
    g.position.y = 0.032;
    disc.add(g);
  }
  const labelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.07, 32);
  const labelMat = blockMaterial();
  labelMat.color.set(PALETTE.ember);
  disc.add(new THREE.Mesh(labelGeo, labelMat));
  // a hairline across the label, so the spin reads
  const tick = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.06, 0.037, 0), new THREE.Vector3(0.19, 0.037, 0)]),
    new THREE.LineBasicMaterial({ color: PALETTE.ink }),
  );
  disc.add(tick);
  const spindle = new Blocks(1, new THREE.Vector3(0.03, 0.14, 0.03), PALETTE.ink);
  put(spindle, 0, 0, 0.08, 0, bone2);
  spindle.commit();
  root.add(spindle.group);

  // tonearm: a base at the pivot, a yaw group, a lift group, the arm and the headshell
  const base = new Blocks(1, new THREE.Vector3(0.16, 0.12, 0.16), PALETTE.ink);
  put(base, 0, PIVOT.x, PIVOT.y + 0.03, PIVOT.z, bone2);
  base.commit();
  root.add(base.group);
  const yawGroup = new THREE.Group();
  yawGroup.position.copy(PIVOT).add(new THREE.Vector3(0, 0.1, 0));
  root.add(yawGroup);
  const liftGroup = new THREE.Group();
  yawGroup.add(liftGroup);
  // the arm reaches along local -x; the counterweight sits just past the pivot
  const arm = new Blocks(2, new THREE.Vector3(ARM_LEN, 0.03, 0.04), PALETTE.ink);
  put(arm, 0, -ARM_LEN / 2, 0, 0, bone2);
  put(arm, 1, 0.1, 0, 0, bone2, new THREE.Vector3(0.1, 2.2, 1.2));
  arm.commit();
  liftGroup.add(arm.group);
  const head = new Blocks(1, new THREE.Vector3(0.12, 0.05, 0.07), PALETTE.ink);
  put(head, 0, -ARM_LEN + 0.02, -0.025, 0, ember);
  head.commit();
  liftGroup.add(head.group);

  // equalizer bars, bottom-anchored, to the right of the plinth
  const bars = new Blocks(BARS, new THREE.Vector3(0.1, 1, 0.1), PALETTE.ink);
  root.add(bars.group);
  const barScale = new THREE.Vector3();
  const heights = new Float32Array(BARS).fill(0.12);
  const barX = (i: number): number => 1.58 + i * 0.16;

  // state
  let playing = o.playing;
  let yaw = YAW_PARKED;
  let lift = LIFT_UP;
  let spin = 0;
  let omega = 0;
  let played = 0; // seconds into the side, for the arm's slow track inward
  let settled = false;

  const barHeight = (i: number, t: number): number => {
    if (!playing) return 0.12;
    const w1 = 2.1 + i * 0.37;
    const w2 = 3.7 + i * 0.23;
    const v = 0.42 + 0.26 * Math.sin(t * w1 + i * 1.3) + 0.18 * Math.sin(t * w2 + i * 0.7);
    return Math.max(0.1, v);
  };

  function layout(): void {
    yawGroup.rotation.y = yaw;
    liftGroup.rotation.z = lift;
    // records turn clockwise seen from above
    disc.rotation.y = -spin;
    for (let i = 0; i < BARS; i++) {
      const h = heights[i] ?? 0.12;
      barScale.set(1, h, 1);
      put(bars, i, barX(i), h / 2, 0, sage, barScale);
    }
    bars.commit();
  }

  stage.run((dt, t) => {
    if (o.reduced) {
      // one still frame per state
      yaw = playing ? YAW_LEAD_IN + 0.12 : YAW_PARKED;
      lift = playing ? 0 : LIFT_UP;
      spin = 0;
      for (let i = 0; i < BARS; i++) heights[i] = playing ? 0.18 + 0.32 * (0.5 + 0.5 * Math.sin(i * 1.9)) : 0.12;
      layout();
      return;
    }
    // parked and still: nothing to draw until the next press
    if (settled && !playing) return false;
    const targetYaw = playing ? YAW_LEAD_IN + (YAW_RUN_OUT - YAW_LEAD_IN) * Math.min(1, played / SIDE) : YAW_PARKED;
    const targetLift = playing ? 0 : LIFT_UP;
    // lift before swinging in, swing out before lifting
    const k = damp(dt, 3.2);
    if (playing) {
      lift += (targetLift - lift) * k * (yaw > YAW_LEAD_IN - 0.08 ? 1 : 0.4);
      yaw += (targetYaw - yaw) * k;
      played += dt;
    } else {
      yaw += (targetYaw - yaw) * k * (lift < LIFT_UP + 0.04 ? 1 : 0.4);
      lift += (targetLift - lift) * k;
      played = 0;
    }
    omega += ((playing ? RPM : 0) - omega) * damp(dt, 1.4);
    spin = (spin + omega * dt) % (Math.PI * 2);
    for (let i = 0; i < BARS; i++) {
      const target = barHeight(i, t);
      heights[i] = (heights[i] ?? 0.12) + (target - (heights[i] ?? 0.12)) * damp(dt, playing ? 14 : 4);
    }
    layout();
    settled = !playing && Math.abs(yaw - YAW_PARKED) < 0.002 && Math.abs(lift - LIFT_UP) < 0.002 && omega < 0.002;
    return true;
  });

  return {
    setPlaying(on: boolean) {
      if (on === playing) return;
      playing = on;
      settled = false;
      if (o.reduced) stage.frame(0);
    },
    dispose() {
      stage.dispose([plinth, spindle, base, arm, head, bars]);
    },
  };
}
