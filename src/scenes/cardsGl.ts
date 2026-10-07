/**
 * WebGL backdrop for the project cards: a hairline floor receding in
 * perspective and a wire frame around each card. The camera copies the CSS
 * perspective exactly (same distance, fov from the deck height), so frames
 * and cards stay aligned while the cards drift and tilt.
 *
 * CSS space is x right, y down, z toward the viewer; three is y up. So a CSS
 * translate3d(x, y, z) rotateX(a) rotateY(b) maps to position (x, -y, z) and
 * rotation (-a, b, 0) in XYZ order.
 */
import * as THREE from 'three';
import { PALETTE, disposeTree, makeRenderer, type Handle } from './gl';
import type { DeckState, Layout } from './cards';

const DEG = Math.PI / 180;

export function mountCardsGl(canvas: HTMLCanvasElement, state: DeckState): Handle {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 6000);
  camera.position.set(0, 0, state.perspective);
  camera.lookAt(0, 0, 0);

  // floor: hairlines at and below the lowest card
  const floor = new THREE.Group();
  scene.add(floor);
  let floorLines: THREE.LineSegments | null = null;
  function buildFloor(l: Layout): void {
    if (floorLines) {
      floor.remove(floorLines);
      floorLines.geometry.dispose();
      (floorLines.material as THREE.Material).dispose();
    }
    const y = -(l.height / 2) - 40;
    const pts: number[] = [];
    const step = 80;
    const xMax = 1800;
    const zMin = -2600;
    const zMax = 500;
    for (let x = -xMax; x <= xMax; x += step) pts.push(x, y, zMin, x, y, zMax);
    for (let z = zMin; z <= zMax; z += step) pts.push(-xMax, y, z, xMax, y, z);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    floorLines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: PALETTE.line }));
    floorLines.frustumCulled = false;
    floor.add(floorLines);
  }

  // one wire frame per card, slightly larger than the card
  const frames: THREE.LineSegments[] = [];
  const frameMats: THREE.LineBasicMaterial[] = [];
  const bone2 = new THREE.Color(PALETTE.bone2);
  const ember = new THREE.Color(PALETTE.ember);
  function buildFrames(l: Layout): void {
    frames.forEach((f) => {
      scene.remove(f);
      f.geometry.dispose();
    });
    frames.length = 0;
    const box = new THREE.BoxGeometry(l.cw + 28, l.ch + 28, 18);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    state.cards.forEach((_, i) => {
      let m = frameMats[i];
      if (!m) {
        m = new THREE.LineBasicMaterial({ color: PALETTE.bone2 });
        frameMats[i] = m;
      }
      const f = new THREE.LineSegments(i === 0 ? edges : edges.clone(), m);
      f.frustumCulled = false;
      scene.add(f);
      frames.push(f);
    });
  }

  function placeFrames(): void {
    state.cards.forEach((c, i) => {
      const f = frames[i];
      const m = frameMats[i];
      if (!f || !m) return;
      f.position.set(c.x, -c.y, c.z + c.lift - 10);
      f.rotation.set(-(c.rx + c.tx) * DEG, (c.ry + c.ty) * DEG, 0, 'XYZ');
      m.color.lerpColors(bone2, ember, Math.min(1, c.lift / 70));
    });
    const p = state.pointer;
    const r = state.deck.getBoundingClientRect();
    const px = p.inside ? ((p.x - r.left) / r.width) * 2 - 1 : 0;
    floor.position.x += (-px * 60 - floor.position.x) * 0.08;
  }

  function resize(l: Layout): void {
    const w = Math.max(1, state.deck.clientWidth);
    const h = Math.max(1, l.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = (2 * Math.atan(h / (2 * state.perspective)) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    buildFloor(l);
    buildFrames(l);
    placeFrames();
    renderer.render(scene, camera);
  }

  const onFrame = (): void => {
    placeFrames();
    renderer.render(scene, camera);
  };

  state.resize.add(resize);
  if (!state.reduced) state.frame.add(onFrame);
  resize(state.layout);

  return {
    dispose() {
      state.resize.delete(resize);
      state.frame.delete(onFrame);
      frameMats.forEach((m) => m.dispose());
      disposeTree(scene);
      renderer.dispose();
    },
  };
}
