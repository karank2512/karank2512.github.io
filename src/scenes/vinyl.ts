/**
 * The turntable after the hero's buttons: pure decoration. A vinyl record on
 * a plinth turning slowly, a tonearm parked beside it and a row of equalizer
 * bars standing at rest. Nothing here plays sound or listens to any; the
 * record's angle is a pure function of time, so the scene can start at any
 * instant, and under reduced motion it is one still frame.
 */
import * as THREE from 'three';
import { Blocks, PALETTE, Stage, blockMaterial, floorRect, put, ring, type Handle, type SceneOptions } from './gl';

const BARS = 7;
const BAR_REST = 0.12;
const ARM_LEN = 0.95;
const PIVOT = new THREE.Vector3(0.72, 0.03, -0.45);
/** Arm yaw, parked just off the rim, and the lift that holds it up. */
const YAW_PARKED = -0.3;
const LIFT_UP = -0.12;
/** The idle turn: one revolution every 12 s, the same rate as the CSS fallback. */
const IDLE = (Math.PI * 2) / 12;

export function mountVinyl(o: SceneOptions): Handle {
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
  // a hairline across the label, so the turn reads
  const tick = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.06, 0.037, 0), new THREE.Vector3(0.19, 0.037, 0)]),
    new THREE.LineBasicMaterial({ color: PALETTE.ink }),
  );
  disc.add(tick);
  const spindle = new Blocks(1, new THREE.Vector3(0.03, 0.14, 0.03), PALETTE.ink);
  put(spindle, 0, 0, 0.08, 0, bone2);
  spindle.commit();
  root.add(spindle.group);

  // tonearm, parked: a base at the pivot, the arm and the headshell
  const base = new Blocks(1, new THREE.Vector3(0.16, 0.12, 0.16), PALETTE.ink);
  put(base, 0, PIVOT.x, PIVOT.y + 0.03, PIVOT.z, bone2);
  base.commit();
  root.add(base.group);
  const yawGroup = new THREE.Group();
  yawGroup.position.copy(PIVOT).add(new THREE.Vector3(0, 0.1, 0));
  yawGroup.rotation.y = YAW_PARKED;
  root.add(yawGroup);
  const liftGroup = new THREE.Group();
  liftGroup.rotation.z = LIFT_UP;
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

  // equalizer bars at rest, bottom-anchored, to the right of the plinth
  const bars = new Blocks(BARS, new THREE.Vector3(0.1, 1, 0.1), PALETTE.ink);
  const barScale = new THREE.Vector3(1, BAR_REST, 1);
  for (let i = 0; i < BARS; i++) put(bars, i, 1.58 + i * 0.16, BAR_REST / 2, 0, sage, barScale);
  bars.commit();
  root.add(bars.group);

  // the only motion: the record turns slowly, clockwise seen from above
  stage.run((_dt, t) => {
    disc.rotation.y = -((t * IDLE) % (Math.PI * 2));
  });

  return {
    dispose() {
      stage.dispose([plinth, spindle, base, arm, head, bars]);
    },
  };
}
