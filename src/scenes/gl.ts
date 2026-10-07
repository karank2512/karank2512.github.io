/**
 * Shared three.js helpers for the three scenes. Everything here follows the
 * site rules: flat fills, hairline edges, the nine palette colors, no fog,
 * no bloom, no transparency tricks. Loaded only with the scene chunks.
 */
import * as THREE from 'three';

export const PALETTE = {
  ink: 0x17130f,
  ink2: 0x201b17,
  line: 0x3a322c,
  line2: 0x2a2420,
  bone: 0xf1e9de,
  bone2: 0xb0a497,
  mute: 0x948878,
  ember: 0xff6b45,
  sage: 0x8fbfb0,
} as const;

export interface Handle {
  dispose(): void;
}

export const coarse = (): boolean => matchMedia('(pointer: coarse)').matches;

/** Renderer with the pixel ratio capped at 2, or 1.5 on touch devices. */
export function makeRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse() ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/** Soft key plus fill, so block faces read as three flat tones. */
export function addLights(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xffffff, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 4, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-3, -1, -2);
  scene.add(fill);
}

/** Flat material; the color comes from per-instance colors. */
export function blockMaterial(): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color: 0xffffff,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}

const BOX_EDGES = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];

/**
 * N boxes drawn as one instanced mesh plus one hairline line set. The line
 * positions are rebuilt on the CPU from the instance matrices, which is cheap
 * for the few hundred boxes each scene uses and keeps the edges exact.
 */
export class Blocks {
  readonly group = new THREE.Group();
  readonly mesh: THREE.InstancedMesh;
  readonly edges: THREE.LineSegments;
  readonly edgeMaterial: THREE.LineBasicMaterial;
  private readonly geometry: THREE.BoxGeometry;
  private readonly material: THREE.MeshLambertMaterial;
  private readonly edgeGeometry: THREE.BufferGeometry;
  private readonly edgePos: THREE.BufferAttribute;
  private readonly corners: Float32Array;
  private readonly tc = new Float32Array(24);
  private readonly tmp = new THREE.Vector3();

  constructor(readonly n: number, size: THREE.Vector3 | number, edgeColor: number) {
    const s = typeof size === 'number' ? new THREE.Vector3(size, size, size) : size;
    this.geometry = new THREE.BoxGeometry(s.x, s.y, s.z);
    this.material = blockMaterial();
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    this.edgePos = new THREE.BufferAttribute(new Float32Array(n * 24 * 3), 3);
    this.edgePos.setUsage(THREE.DynamicDrawUsage);
    this.edgeGeometry = new THREE.BufferGeometry();
    this.edgeGeometry.setAttribute('position', this.edgePos);
    this.edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor });
    this.edges = new THREE.LineSegments(this.edgeGeometry, this.edgeMaterial);
    this.edges.frustumCulled = false;

    const hx = s.x / 2;
    const hy = s.y / 2;
    const hz = s.z / 2;
    this.corners = new Float32Array([
      -hx, -hy, -hz, hx, -hy, -hz, hx, hy, -hz, -hx, hy, -hz,
      -hx, -hy, hz, hx, -hy, hz, hx, hy, hz, -hx, hy, hz,
    ]);
    this.group.add(this.mesh, this.edges);
  }

  /** Place box i. Call commit() after the last set() of a frame. */
  set(i: number, m: THREE.Matrix4): void {
    this.mesh.setMatrixAt(i, m);
    const c = this.corners;
    const tc = this.tc;
    for (let k = 0; k < 8; k++) {
      this.tmp.set(c[k * 3] ?? 0, c[k * 3 + 1] ?? 0, c[k * 3 + 2] ?? 0).applyMatrix4(m);
      tc[k * 3] = this.tmp.x;
      tc[k * 3 + 1] = this.tmp.y;
      tc[k * 3 + 2] = this.tmp.z;
    }
    const arr = this.edgePos.array as Float32Array;
    let o = i * 72;
    for (let k = 0; k < 24; k++) {
      const ci = (BOX_EDGES[k] ?? 0) * 3;
      arr[o++] = tc[ci] ?? 0;
      arr[o++] = tc[ci + 1] ?? 0;
      arr[o++] = tc[ci + 2] ?? 0;
    }
  }

  color(i: number, c: THREE.Color): void {
    this.mesh.setColorAt(i, c);
  }

  commit(): void {
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.edgePos.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.edgeGeometry.dispose();
    this.edgeMaterial.dispose();
    this.mesh.dispose();
  }
}

/** A hairline polyline from points. */
export function polyline(points: THREE.Vector3[], color: number, loop = false): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color });
  return loop ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);
}

/** A hairline circle in the plane whose normal is `axis`. */
export function ring(radius: number, axis: 'x' | 'y' | 'z', color: number, n = 48): THREE.LineLoop {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a) * radius;
    const s = Math.sin(a) * radius;
    pts.push(axis === 'x' ? new THREE.Vector3(0, c, s) : axis === 'y' ? new THREE.Vector3(c, 0, s) : new THREE.Vector3(c, s, 0));
  }
  return polyline(pts, color, true) as THREE.LineLoop;
}

/**
 * Render loop that only runs while the element is on screen and the tab is
 * visible. dt is clamped so a background tab does not jump on return.
 */
export class Loop {
  private raf = 0;
  private last = 0;
  private onScreen = false;
  private running = false;
  private readonly io: IntersectionObserver;
  private readonly onVisibility = (): void => this.sync();

  constructor(el: Element, private readonly tick: (dt: number, t: number) => void) {
    this.io = new IntersectionObserver(
      (entries) => {
        this.onScreen = entries.some((e) => e.isIntersecting);
        this.sync();
      },
      { rootMargin: '80px' },
    );
    this.io.observe(el);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  private sync(): void {
    const want = this.onScreen && !document.hidden;
    if (want && !this.running) this.start();
    else if (!want && this.running) this.stop();
  }

  private start(): void {
    this.running = true;
    this.last = performance.now();
    const frame = (now: number): void => {
      if (!this.running) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
      this.last = now;
      this.tick(dt, now / 1000);
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose(): void {
    this.stop();
    this.io.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
}

/** Dispose every geometry and material under a root. */
export function disposeTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const obj = o as THREE.Object3D & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
    obj.geometry?.dispose();
    const m = obj.material;
    if (Array.isArray(m)) m.forEach((x) => x.dispose());
    else m?.dispose();
  });
}

/**
 * Size the renderer and camera for a canvas. `shift` > 1 renders the left
 * part of a wider virtual view, so the scene centre lands right of the
 * canvas centre (at 0.5 * shift of the width) and leaves room for text.
 */
export function frameCamera(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  w: number,
  h: number,
  shift: number,
): void {
  renderer.setSize(w, h, false);
  camera.aspect = (shift * w) / h;
  if (shift > 1) camera.setViewOffset(shift * w, h, 0, 0, w, h);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}

/**
 * Camera distance so an object of horizontal radius rh and vertical radius
 * rv fits inside the visible region, given the shift used by frameCamera.
 */
export function fitDistance(
  camera: THREE.PerspectiveCamera,
  rh: number,
  rv: number,
  shift: number,
  clearLeft = 0,
): number {
  const tan = Math.tan((camera.fov * Math.PI) / 360);
  // Usable fraction of the full view's half width on the tighter side. The
  // right margin ends at the canvas edge, the left one at `clearLeft`, the
  // fraction of the canvas width that must stay free for HTML text.
  const side = shift > 1 ? Math.min(2 / shift - 1, 1 - (2 * clearLeft) / shift) * 0.92 : 0.86;
  return Math.max(rh / (side * tan * camera.aspect), rv / (0.82 * tan));
}

export const smoothstep = (v: number): number => {
  const t = v < 0 ? 0 : v > 1 ? 1 : v;
  return t * t * (3 - 2 * t);
};

export const damp = (dt: number, rate: number): number => 1 - Math.exp(-rate * dt);
