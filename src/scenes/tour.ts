/**
 * thaw engineering tour: a scroll-driven camera path through five views of
 * what the storage layer saves (weights, KV cache, prefix-hash table,
 * scheduler state) and the fork that brings it all back. Progress comes from
 * the component script; this module only moves the camera and renders.
 */
import * as THREE from 'three';
import { columns, blockAt, LAYERS, KV, PER_COL, TRUNK } from './lattice';
import {
  Blocks,
  Loop,
  PALETTE,
  addLights,
  damp,
  disposeTree,
  fitDistance,
  frameCamera,
  makeRenderer,
  polyline,
  smoothstep,
  type Handle,
} from './gl';

export interface TourOptions {
  canvas: HTMLCanvasElement;
  stage: HTMLElement;
  reduced: boolean;
  onFirstFrame: () => void;
}

export interface TourHandle extends Handle {
  /** 0 at the first view, 1 at the fork. */
  setProgress(p: number): void;
}

interface View {
  target: THREE.Vector3;
  dist: number;
  yaw: number;
  pitch: number;
}

interface Part {
  group: THREE.Group;
  edge: THREE.LineBasicMaterial;
  center: THREE.Vector3;
}

const mat = new THREE.Matrix4();
const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const one = new THREE.Vector3(1, 1, 1);
const place = (b: Blocks, i: number, x: number, y: number, z: number, c: THREE.Color): void => {
  mat.compose(pos.set(x, y, z), quat, one);
  b.set(i, mat);
  b.color(i, c);
};

export function mountTour(o: TourOptions): TourHandle {
  const renderer = makeRenderer(o.canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  addLights(scene);

  const bone2 = new THREE.Color(PALETTE.bone2);
  const sage = new THREE.Color(PALETTE.sage);
  const ember = new THREE.Color(PALETTE.ember);
  const inkC = new THREE.Color(PALETTE.ink);
  const emberC = new THREE.Color(PALETTE.ember);
  const sageC = new THREE.Color(PALETTE.sage);

  const system = new THREE.Group();
  scene.add(system);
  const parts: Part[] = [];
  const owned: Blocks[] = [];

  // 1. weights: a stack of thin slabs, one per layer
  {
    const n = 20;
    const b = new Blocks(n, new THREE.Vector3(1.8, 0.07, 1.2), PALETTE.ink);
    owned.push(b);
    for (let i = 0; i < n; i++) place(b, i, 0, (i - (n - 1) / 2) * 0.16, 0, bone2);
    b.commit();
    b.group.position.set(-5.4, 0, 0);
    system.add(b.group);
    parts.push({ group: b.group, edge: b.edgeMaterial, center: b.group.position.clone() });
  }

  // 2. KV cache: the running session's lattice, head token in ember
  {
    const cols = columns(0).filter((c) => c.kind === 'trunk');
    const b = new Blocks(cols.length * PER_COL, 0.26, PALETTE.ink);
    owned.push(b);
    const x0 = ((TRUNK - 1) * 0.36) / 2;
    cols.forEach((col, ci) => {
      for (let l = 0; l < LAYERS; l++) {
        for (let k = 0; k < KV; k++) {
          const p = blockAt(col, l, k);
          place(b, ci * PER_COL + l * KV + k, p.x - x0, p.y, p.z, col.index === TRUNK - 1 ? ember : bone2);
        }
      }
    });
    b.commit();
    b.group.position.set(-1.4, 0, 0);
    system.add(b.group);
    parts.push({ group: b.group, edge: b.edgeMaterial, center: b.group.position.clone() });
  }

  // 3. prefix-hash table: a flat grid of buckets, hits raised in sage, with
  //    hairlines back to the cache blocks they point at
  {
    const cols = 8;
    const rows = 6;
    const b = new Blocks(cols * rows, new THREE.Vector3(0.3, 0.05, 0.3), PALETTE.ink);
    owned.push(b);
    const hits = new Set([3, 12, 21, 26, 35, 41]);
    const lines: THREE.Vector3[] = [];
    const hitPts: THREE.Vector3[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const hit = hits.has(i);
        const x = (c - (cols - 1) / 2) * 0.4;
        const z = (r - (rows - 1) / 2) * 0.4;
        const y = hit ? -0.5 : -0.65;
        place(b, i, x, y, z, hit ? sage : bone2);
        if (hit) hitPts.push(new THREE.Vector3(x, y + 0.03, z));
      }
    }
    b.commit();
    b.group.position.set(2.6, 0, -0.4);
    system.add(b.group);
    // connectors from three hits to three cache columns (world space of the system group)
    const kvX = -1.4;
    const targets = [
      new THREE.Vector3(kvX - 1.2, 0.95, 0.2),
      new THREE.Vector3(kvX - 0.1, 0.95, 0.2),
      new THREE.Vector3(kvX + 1.1, 0.95, 0.2),
    ];
    for (let i = 0; i < 3; i++) {
      const h = hitPts[i * 2];
      const t = targets[i];
      if (!h || !t) continue;
      lines.push(h.clone().add(b.group.position), t);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(lines);
    const connectors = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: PALETTE.sage }));
    system.add(connectors);
    parts.push({ group: b.group, edge: b.edgeMaterial, center: b.group.position.clone() });
  }

  // 4. scheduler state: a rail with a queue of requests, the running one in ember
  {
    const n = 7;
    const b = new Blocks(n, 0.3, PALETTE.ink);
    owned.push(b);
    for (let i = 0; i < n; i++) place(b, i, (i - (n - 1) / 2) * 0.46, 0, 0, i === 0 ? ember : bone2);
    b.commit();
    const rail = new Blocks(1, new THREE.Vector3(3.4, 0.04, 0.04), PALETTE.ink);
    owned.push(rail);
    place(rail, 0, 0, -0.25, 0, bone2);
    rail.commit();
    const slots = new Blocks(3, new THREE.Vector3(0.9, 0.05, 0.4), PALETTE.ink);
    owned.push(slots);
    for (let i = 0; i < 3; i++) place(slots, i, (i - 1) * 1.1, 0.7, -0.3, i === 1 ? sage : bone2);
    slots.commit();
    b.group.add(rail.group, slots.group);
    b.group.position.set(6.0, 0, 0);
    system.add(b.group);
    parts.push({ group: b.group, edge: b.edgeMaterial, center: b.group.position.clone() });
  }

  // 5. the fork: three restored copies of the whole snapshot, flown out along
  //    ember curves from the original
  const forkOffsets = [new THREE.Vector3(0.6, 2.4, -5.2), new THREE.Vector3(0.9, -0.2, 5.6), new THREE.Vector3(-0.5, -2.6, -2.2)];
  const clones: THREE.Group[] = [];
  const curves: THREE.QuadraticBezierCurve3[] = [];
  const curveLines: THREE.Line[] = [];
  const CURVE_N = 48;
  const sageEdge = new THREE.LineBasicMaterial({ color: PALETTE.sage });
  const systemCenter = new THREE.Vector3(0.3, 0, 0);
  for (const off of forkOffsets) {
    const clone = system.clone();
    clone.traverse((obj) => {
      if (obj instanceof THREE.LineSegments) obj.material = sageEdge;
    });
    clone.visible = false;
    scene.add(clone);
    clones.push(clone);
    const end = off.clone();
    const mid = end.clone().multiplyScalar(0.5);
    mid.y += 1.2;
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), mid, end);
    curves.push(curve);
    const pts = curve.getPoints(CURVE_N).map((p) => p.add(systemCenter));
    const line = polyline(pts, PALETTE.ember);
    line.geometry.setDrawRange(0, 0);
    scene.add(line);
    curveLines.push(line);
  }

  // camera path
  const views: View[] = [
    { target: parts[0]?.center.clone() ?? new THREE.Vector3(), dist: 6.4, yaw: 0.6, pitch: 0.28 },
    { target: parts[1]?.center.clone() ?? new THREE.Vector3(), dist: 6.2, yaw: 0.35, pitch: 0.3 },
    { target: parts[2]?.center.clone().add(new THREE.Vector3(0, -0.5, 0)) ?? new THREE.Vector3(), dist: 5.4, yaw: -0.35, pitch: 0.6 },
    { target: parts[3]?.center.clone() ?? new THREE.Vector3(), dist: 6.0, yaw: 0.55, pitch: 0.22 },
    { target: systemCenter.clone(), dist: 20, yaw: 0.75, pitch: 0.34 },
  ];

  let target = o.reduced ? 1 : 0;
  let shown = target;
  let first = true;
  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const a = new THREE.Vector3();
  const bpos = new THREE.Vector3();

  const posOf = (v: View, out: THREE.Vector3): THREE.Vector3 =>
    out.set(
      v.target.x + Math.sin(v.yaw) * Math.cos(v.pitch) * v.dist,
      v.target.y + Math.sin(v.pitch) * v.dist,
      v.target.z + Math.cos(v.yaw) * Math.cos(v.pitch) * v.dist,
    );

  function apply(p: number): void {
    const n = views.length - 1;
    const x = Math.min(n, Math.max(0, p * n));
    const s = Math.min(n - 1, Math.floor(x));
    const t = smoothstep(x - s);
    const v0 = views[s];
    const v1 = views[s + 1];
    if (!v0 || !v1) return;
    posOf(v0, a);
    posOf(v1, bpos);
    camPos.lerpVectors(a, bpos, t);
    camPos.y += Math.sin(t * Math.PI) * 0.9;
    camTarget.lerpVectors(v0.target, v1.target, t);
    camera.position.copy(camPos);
    camera.lookAt(camTarget);

    // highlight: the subsystem in view gets ember hairlines
    for (let i = 0; i < parts.length; i++) {
      const w = 1 - Math.min(1, Math.abs(x - i) / 0.6);
      parts[i]?.edge.color.lerpColors(inkC, emberC, smoothstep(w));
    }
    // the fork: copies fly out along the curves during the last segment
    const fk = smoothstep((x - (n - 1)) / 1);
    for (let i = 0; i < clones.length; i++) {
      const clone = clones[i];
      const curve = curves[i];
      const line = curveLines[i];
      if (!clone || !curve || !line) continue;
      const q = smoothstep((fk - i * 0.12) / 0.76);
      clone.visible = q > 0.001;
      curve.getPoint(q, clone.position);
      line.geometry.setDrawRange(0, Math.max(0, Math.floor(q * (CURVE_N + 1))));
    }
    sageEdge.color.lerpColors(inkC, sageC, fk);
  }

  function render(): void {
    renderer.render(scene, camera);
    if (first) {
      first = false;
      o.onFirstFrame();
    }
  }

  function resize(): void {
    const w = Math.max(1, o.stage.clientWidth);
    const h = Math.max(1, o.stage.clientHeight);
    const shift = w > 820 ? 1.3 : 1;
    frameCamera(renderer, camera, w, h, shift);
    const wide = views[4];
    if (wide) wide.dist = fitDistance(camera, 9.2, 5.2, shift, 0.08);
    apply(shown);
    render();
  }
  const ro = new ResizeObserver(() => resize());
  ro.observe(o.stage);
  resize();

  if (o.reduced) {
    return {
      setProgress() {
        /* one still frame */
      },
      dispose() {
        ro.disconnect();
        owned.forEach((b) => b.dispose());
        disposeTree(scene);
        renderer.dispose();
      },
    };
  }

  const loop = new Loop(o.stage, (dt) => {
    if (Math.abs(target - shown) < 0.0005) return;
    shown += (target - shown) * damp(dt, 9);
    apply(shown);
    render();
  });

  return {
    setProgress(p: number) {
      target = Math.min(1, Math.max(0, p));
    },
    dispose() {
      loop.dispose();
      ro.disconnect();
      owned.forEach((b) => b.dispose());
      sageEdge.dispose();
      disposeTree(scene);
      renderer.dispose();
    },
  };
}
