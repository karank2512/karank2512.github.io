/**
 * The role scenes: one small procedural drawing per Experience and
 * Leadership entry, in the style of the project cards (flat shaded blocks
 * with Ink hairline edges, Bone 2 at rest, Ember for the one accent and Sage
 * for the second). All seven share this chunk and the Stage shell in gl.ts,
 * so a tile costs one dynamic import and one renderer. Every position is a
 * pure function of time: a scene can start at any instant, nothing
 * accumulates, and the reduced-motion still is one instant of the same
 * motion. Each scene yaws by 0.04 rad on a slow sine so it is never frozen.
 *
 * mount() reads the entry id from the stage's data-role attribute. The
 * static drawing of each scene lives in Mark.astro and uses the same
 * coordinates, so the swap from SVG to canvas is quiet.
 */
import * as THREE from 'three';
import { Blocks, PALETTE, Stage, floorRect, hash, polyline, put, ring, smoothstep, type Handle, type SceneOptions, type View } from './gl';

interface Built {
  tick(t: number): void;
  blocks: Blocks[];
}

interface RoleScene {
  view: View;
  /** Scene time of the one frame drawn under reduced motion. */
  still: number;
  build(root: THREE.Group): Built;
}

const C = {
  bone2: new THREE.Color(PALETTE.bone2),
  sage: new THREE.Color(PALETTE.sage),
  ember: new THREE.Color(PALETTE.ember),
  mute: new THREE.Color(PALETTE.mute),
  ink2: new THREE.Color(PALETTE.ink2),
};

const v = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
const cyc = (t: number, period: number): number => ((t % period) + period) % period;
const tiny = (s: number): number => Math.max(0.0001, s);
/** A damped spring from 0 to 1 with a small overshoot, settled by u = 1.5. */
const spring = (u: number): number => (u <= 0 ? 0 : 1 - Math.exp(-5 * u) * (Math.cos(6 * u) + (5 / 6) * Math.sin(6 * u)));
/** Quadratic curve from a through c to b. */
const bez = (a: number, c: number, b: number, q: number): number => {
  const u = 1 - q;
  return u * u * a + 2 * u * q * c + q * q * b;
};
const sv = new THREE.Vector3();
const lerpColor = new THREE.Color();

/**
 * thaw: the fork. A running session, seven token columns of three blocks
 * with an Ember head stepping along them, reaches an Ember ring and forks
 * into three Sage branches that fly apart on a spring and settle, the new
 * columns growing in and each tip turning Ember. Then it folds back and
 * forks again. The hero does the same at full size.
 */
const thaw: RoleScene = {
  view: { rh: 2.4, rv: 1.3, yaw: 0.5, pitch: 0.3, target: v(0.55, 0, 0) },
  still: 6,
  build(root) {
    const T = 7;
    const B = 3;
    const L = 5;
    const LAYERS = 3;
    const STEP = 0.34;
    const H = 0.26;
    const SZ = 0.22;
    const X0 = -1.2;
    const FORK = X0 + (T - 0.5) * STEP;
    const X = v(1, 0, 0);
    const DIRS = [v(0.72, 0.5, -0.42), v(0.72, 0.05, 0.66), v(0.72, -0.5, -0.3)].map((d) => d.normalize());
    const trunk = new Blocks(T * LAYERS, SZ, PALETTE.ink);
    const branches = new Blocks(B * L * LAYERS, SZ, PALETTE.ink);
    root.add(trunk.group, branches.group);
    const forkRing = ring(((LAYERS - 1) / 2) * H + SZ * 1.3, 'x', PALETTE.ember);
    forkRing.position.set(FORK, 0, 0);
    root.add(forkRing);
    const dir = new THREE.Vector3();
    const P = 11;
    return {
      blocks: [trunk, branches],
      tick(t) {
        const c = cyc(t, P);
        let f = 0;
        if (c >= 1.2 && c < 8.5) f = spring((c - 1.2) / 1.6);
        else if (c >= 8.5 && c < 10) f = 1 - smoothstep((c - 8.5) / 1.5);
        const head = Math.floor(t * 3) % T;
        for (let i = 0; i < T; i++) {
          for (let l = 0; l < LAYERS; l++) {
            put(trunk, i * LAYERS + l, X0 + i * STEP, (l - 1) * H, 0, i === head ? C.ember : C.bone2);
          }
        }
        trunk.commit();
        for (let k = 0; k < B; k++) {
          const fk = smoothstep((f - k * 0.08) / 0.84);
          dir.lerpVectors(X, DIRS[k] ?? X, fk).normalize();
          const wy = Math.sin(t * 0.9 + k * 1.7) * 0.04 * fk;
          const wz = Math.cos(t * 0.7 + k * 2.1) * 0.04 * fk;
          for (let j = 0; j < L; j++) {
            const d = (j + 1) * STEP;
            const arc = (Math.sin(fk * Math.PI) * 0.12 * (j + 1)) / L;
            const s = j >= 2 ? smoothstep((fk - (0.3 + (j - 2) * 0.18)) / 0.25) : 1;
            const color = j === L - 1 && fk > 0.5 ? C.ember : C.sage;
            for (let l = 0; l < LAYERS; l++) {
              put(
                branches,
                (k * L + j) * LAYERS + l,
                FORK + dir.x * d,
                dir.y * d + arc + wy + (l - 1) * H,
                dir.z * d + wz,
                color,
                tiny(s),
              );
            }
          }
        }
        branches.commit();
      },
    };
  },
};

/**
 * Eurofins: the forecast. A ledger of historical lab records on the left.
 * One at a time a record slides along a lane into the model, an Ink 2 box
 * with Ember edges, and a forecast bar rises on the right in Sage with an
 * Ember cap on top whose width is its confidence score. Five records, five
 * forecasts, then the bars fall and the ledger refills.
 */
const eurofins: RoleScene = {
  view: { rh: 2.6, rv: 1.0, yaw: 0.5, pitch: 0.36, target: v(-0.15, 0, 0) },
  still: 7.2,
  build(root) {
    const N = 5;
    const P = 9;
    const GAP = 1.5;
    const LX = -2.4;
    const MX = -0.7;
    const FLOOR = -0.5;
    const ledger = new Blocks(N, v(0.6, 0.06, 0.42), PALETTE.ink);
    const model = new Blocks(1, v(0.5, 0.62, 0.5), PALETTE.ember);
    put(model, 0, MX, FLOOR + 0.31, 0, C.ink2);
    model.commit();
    const bars = new Blocks(N, v(0.24, 1, 0.24), PALETTE.ink);
    const caps = new Blocks(N, v(0.36, 0.045, 0.3), PALETTE.ink);
    root.add(ledger.group, model.group, bars.group, caps.group);
    root.add(polyline([v(LX, FLOOR, 0), v(MX, FLOOR, 0)], PALETTE.line));
    root.add(floorRect(0.2, -0.35, 2.5, 0.35, FLOOR, PALETTE.line));
    const heights = Array.from({ length: N }, (_, i) => 0.35 + hash(i * 5 + 1) * 0.55);
    const conf = Array.from({ length: N }, (_, i) => 0.45 + hash(i * 7 + 3) * 0.55);
    return {
      blocks: [ledger, model, bars, caps],
      tick(t) {
        const c = cyc(t, P);
        for (let i = 0; i < N; i++) {
          // the record: on the ledger until its turn, then along the lane into the model
          const a = c - i * GAP;
          const restY = FLOOR + 0.03 + (N - 1 - i) * 0.085;
          let x = LX;
          let y = restY;
          let s = 1;
          if (a >= 0 && a < 0.9) {
            const q = smoothstep(a / 0.9);
            x = LX + (MX - LX) * q;
            y = restY + (FLOOR + 0.3 - restY) * q;
            s = 1 - smoothstep((q - 0.8) / 0.2);
          } else if (a >= 0.9) {
            s = c >= 8.3 ? smoothstep((c - 8.3) / 0.5) : 0;
          }
          put(ledger, i, x, y, 0, C.bone2, tiny(s));

          // the forecast: a bar that rises once the record is in, then a cap
          const hi = heights[i] ?? 0.5;
          let h = a >= 0.9 ? hi * smoothstep((a - 0.9) / 0.6) : 0;
          if (c >= 7.6) h = hi * (1 - smoothstep((c - 7.6) / 0.6));
          const bx = 0.45 + i * 0.45;
          put(bars, i, bx, FLOOR + h / 2, 0, C.sage, sv.set(1, tiny(h), 1));
          const cs = h > 0.02 ? smoothstep((h / hi - 0.9) / 0.1) : 0;
          put(caps, i, bx, FLOOR + h + 0.03, 0, C.ember, sv.set(tiny((conf[i] ?? 0.5) * cs), tiny(cs), tiny(cs)));
        }
        ledger.commit();
        bars.commit();
        caps.commit();
      },
    };
  },
};

/**
 * ECE support: the watch. Three managed machines on the left, Windows,
 * macOS and Linux, send log ticks along a lane into a monitor on the right.
 * Most ticks are Bone 2; a recurring failure is an Ember tick. When one
 * reaches the monitor, an Ember marker rises over the machine it came from
 * and turns Sage as it is handled, before any ticket would have arrived.
 */
const ece: RoleScene = {
  view: { rh: 2.6, rv: 1.0, yaw: 0.45, pitch: 0.36, target: v(-0.3, 0, 0) },
  still: 9.3,
  build(root) {
    const FLOOR = -0.45;
    const MX = [-2.5, -1.75, -1.0];
    const XE = 1.65;
    const SLOTS = 12;
    const P = 4;
    const GAP = P / SLOTS;
    const V = 1.3;
    const LANE_Z = 0.5;
    const machines = new Blocks(3, v(0.5, 0.34, 0.42), PALETTE.ink);
    const flags = new Blocks(3, 0.14, PALETTE.ink);
    const monitor = new Blocks(1, v(0.5, 0.7, 0.5), PALETTE.ember);
    put(monitor, 0, 1.9, FLOOR + 0.35, 0, C.ink2);
    monitor.commit();
    const ticks = new Blocks(SLOTS, v(0.05, 0.14, 0.05), PALETTE.ink);
    root.add(machines.group, flags.group, monitor.group, ticks.group);
    root.add(polyline([v(MX[0] ?? 0, FLOOR, LANE_Z), v(XE, FLOOR, LANE_Z)], PALETTE.line));
    for (const mx of MX) root.add(polyline([v(mx, FLOOR, 0.21), v(mx, FLOOR, LANE_Z)], PALETTE.line));
    for (let m = 0; m < 3; m++) put(machines, m, MX[m] ?? 0, FLOOR + 0.17, 0, C.bone2);
    machines.commit();
    const flagAge = [-1, -1, -1];
    return {
      blocks: [machines, flags, monitor, ticks],
      tick(t) {
        flagAge.fill(-1);
        for (let i = 0; i < SLOTS; i++) {
          const since = t - i * GAP;
          const j = Math.floor(since / P);
          // the current occurrence and the previous one: a flag outlives its tick
          for (let back = 0; back < 2; back++) {
            const n = i + (j - back) * SLOTS;
            const age = since - (j - back) * P;
            const bad = hash(n * 2 + 5) < 0.22;
            const m = Math.min(2, Math.floor(hash(n * 3 + 1) * 3));
            const x0 = MX[m] ?? 0;
            const ta = (XE - x0) / V;
            if (back === 0) {
              const s = age < ta ? smoothstep(age / 0.25) : 0;
              put(ticks, i, x0 + V * Math.min(age, ta), FLOOR + 0.07, LANE_Z, bad ? C.ember : C.bone2, tiny(s));
            }
            if (bad && age >= ta && age - ta < 2.2) {
              const fa = age - ta;
              const cur = flagAge[m] ?? -1;
              if (cur < 0 || fa < cur) flagAge[m] = fa;
            }
          }
        }
        ticks.commit();
        for (let m = 0; m < 3; m++) {
          const fa = flagAge[m] ?? -1;
          const rise = fa < 0 ? 0 : smoothstep(fa / 0.3);
          const s = rise * (fa < 0 ? 0 : 1 - smoothstep((fa - 1.8) / 0.4));
          put(flags, m, MX[m] ?? 0, FLOOR + 0.34 + 0.16 + rise * 0.1, 0, fa >= 0 && fa < 1.2 ? C.ember : C.sage, tiny(s));
        }
        flags.commit();
      },
    };
  },
};

/**
 * The AI lab: retrieval. An index of twelve document cards lies flat on the
 * left. A query, an Ember cube, arrives over it; the three nearest cards
 * rise, turn Sage and travel along curves into the app on the right, a
 * standing hairline frame, where they stack as the answer. Then the query
 * clears and the cards return.
 */
const aiLab: RoleScene = {
  view: { rh: 2.7, rv: 1.1, yaw: 0.5, pitch: 0.4, target: v(-0.2, 0, 0) },
  still: 4.5,
  build(root) {
    const FLOOR = -0.45;
    const GX = [-2.4, -1.9, -1.4, -0.9];
    const GZ = [-0.55, 0, 0.55];
    const P = 7;
    const AX = 1.65;
    const AZ = 0.5;
    const docs = new Blocks(12, v(0.34, 0.02, 0.44), PALETTE.ink);
    const query = new Blocks(1, 0.16, PALETTE.ink);
    root.add(docs.group, query.group);
    root.add(
      polyline([v(1.0, FLOOR, 0.55), v(2.3, FLOOR, 0.55), v(2.3, FLOOR + 0.95, 0.55), v(1.0, FLOOR + 0.95, 0.55)], PALETTE.line, true),
    );
    root.add(floorRect(1.0, -0.25, 2.3, 0.55, FLOOR, PALETTE.line));
    return {
      blocks: [docs, query],
      tick(t) {
        const c = cyc(t, P);
        const n = Math.floor(t / P);
        const base = Math.floor(hash(n * 7 + 1) * 12);
        const chosen = [base, (base + 5) % 12, (base + 7) % 12];

        const qs = smoothstep(c / 0.3) * (1 - smoothstep((c - 5.5) / 0.6));
        const u = smoothstep((c - 0.2) / 1.0);
        put(query, 0, -2.9 + (-1.65 + 2.9) * u, FLOOR + 0.55 + Math.sin(u * Math.PI) * 0.15, 0, C.ember, tiny(qs));
        query.commit();

        for (let d = 0; d < 12; d++) {
          const gx = GX[d % 4] ?? 0;
          const gz = GZ[Math.floor(d / 4)] ?? 0;
          let x = gx;
          let y = FLOOR + 0.01;
          let z = gz;
          let s = 1;
          let color = C.bone2;
          const k = chosen.indexOf(d);
          if (k >= 0) {
            const r = smoothstep((c - 1.2 - k * 0.15) / 0.6);
            y += r * 0.35;
            if (r > 0) color = C.sage;
            const fl = smoothstep((c - 2.1 - k * 0.25) / 1.1);
            if (fl > 0) {
              const ey = FLOOR + 0.22 + k * 0.18;
              const nx = bez(x, (x + AX) / 2, AX, fl);
              const ny = bez(y, Math.max(y, ey) + 0.7, ey, fl);
              const nz = bez(z, (z + AZ) / 2, AZ, fl);
              x = nx;
              y = ny;
              z = nz;
            }
            if (c > 5.5) s = 1 - smoothstep((c - 5.5) / 0.6);
            if (c > 6.4) {
              s = smoothstep((c - 6.4) / 0.5);
              color = C.bone2;
              x = gx;
              y = FLOOR + 0.01;
              z = gz;
            }
          }
          put(docs, d, x, y, z, color, tiny(s));
        }
        docs.commit();
      },
    };
  },
};

/**
 * HCLSoftware: the sweep. A platform slab carries ten modules. A thin test
 * plane with Ember edges sweeps across it and each module it has passed
 * turns Sage. When the sweep is done a compliance report, a standing slab
 * with four lines, rises on the right and gets an Ember stamp. Then it all
 * resets and the next run starts.
 */
const hcl: RoleScene = {
  view: { rh: 2.7, rv: 1.0, yaw: 0.5, pitch: 0.4, target: v(0.1, 0, 0) },
  still: 5,
  build(root) {
    const FLOOR = -0.45;
    const P = 8.5;
    const platform = new Blocks(1, v(2.8, 0.1, 1.1), PALETTE.line);
    put(platform, 0, -0.55, FLOOR + 0.05, 0, C.ink2);
    platform.commit();
    const MODS: Array<[number, number]> = [];
    for (let col = 0; col < 5; col++) for (const z of [-0.3, 0.3]) MODS.push([-1.6 + col * 0.45, z]);
    const modules = new Blocks(MODS.length, 0.26, PALETTE.ink);
    const plane = new Blocks(1, v(0.03, 0.7, 1.3), PALETTE.ember);
    const report = new Blocks(1, v(0.6, 0.78, 0.05), PALETTE.ink);
    const lines = new Blocks(4, v(0.4, 0.03, 0.02), PALETTE.ink2);
    const stamp = new Blocks(1, 0.1, PALETTE.ink);
    root.add(platform.group, modules.group, plane.group, report.group, lines.group, stamp.group);
    const RX = 1.9;
    return {
      blocks: [platform, modules, plane, report, lines, stamp],
      tick(t) {
        const c = cyc(t, P);
        const sx = -2.0 + 2.9 * smoothstep((c - 0.5) / 3.0);
        const ps = smoothstep((c - 0.3) / 0.2) * (1 - smoothstep((c - 3.6) / 0.2));
        put(plane, 0, sx, FLOOR + 0.45, 0, C.ink2, tiny(ps));
        plane.commit();
        const fade = c >= 7.5 ? smoothstep((c - 7.5) / 0.5) : 0;
        MODS.forEach(([mx, mz], i) => {
          const passed = c >= 0.5 && sx > mx;
          const near = (sx - mx) / 0.15;
          const dy = Math.exp(-(near * near)) * 0.06 * ps;
          lerpColor.lerpColors(passed ? C.sage : C.bone2, C.bone2, fade);
          put(modules, i, mx, FLOOR + 0.1 + 0.13 + dy, mz, lerpColor);
        });
        modules.commit();
        const rs = smoothstep((c - 3.7) / 0.6) * (1 - fade);
        put(report, 0, RX, FLOOR + 0.39, 0, C.bone2, tiny(rs));
        report.commit();
        for (let k = 0; k < 4; k++) put(lines, k, RX - 0.04, FLOOR + 0.62 - k * 0.13, 0.035, C.ink2, tiny(rs));
        lines.commit();
        const ss = smoothstep((c - 4.4) / 0.3) * (1 - fade);
        put(stamp, 0, RX + 0.16, FLOOR + 0.18, 0.045, C.ember, tiny(ss));
        stamp.commit();
      },
    };
  },
};

/**
 * Kappa Eta Kappa: the network. A national hub, an Ember block at the
 * centre of a hairline floor, and ten campus nodes around it. Three are
 * chapters already, Sage and linked to the hub. One by one an outreach
 * pulse leaves the hub for a campus without a chapter; when it lands the
 * node lights Sage and a hairline draws back to the hub. When every campus
 * is linked the new ones go quiet and the round starts again.
 */
/** Campus positions on the floor, x and z; the same list draws the static mark. */
const CAMPUSES: Array<[number, number]> = [
  [-2.2, -0.6], [-1.6, 0.8], [-0.9, -0.95], [0.4, 0.95], [1.3, -0.8],
  [2.3, 0.2], [-0.5, 0.55], [1.1, 0.85], [-2.4, 0.3], [0.9, -0.2],
];
const EXISTING = [0, 4, 7];
const NEW_ORDER = [1, 2, 3, 5, 6, 8, 9];

const kekVp: RoleScene = {
  view: { rh: 2.7, rv: 1.0, yaw: 0.4, pitch: 0.5, target: v(0, 0, 0) },
  still: 13,
  build(root) {
    const FLOOR = -0.3;
    const P = 15;
    const HY = FLOOR + 0.08;
    root.add(floorRect(-2.7, -1.3, 2.7, 1.3, FLOOR, PALETTE.line));
    const hub = new Blocks(1, 0.3, PALETTE.ink);
    put(hub, 0, 0, FLOOR + 0.15, 0, C.ember);
    hub.commit();
    const nodes = new Blocks(CAMPUSES.length, 0.16, PALETTE.ink);
    const pulse = new Blocks(1, 0.08, PALETTE.ink);
    root.add(hub.group, nodes.group, pulse.group);
    const linkPos = new THREE.BufferAttribute(new Float32Array(CAMPUSES.length * 6), 3);
    linkPos.setUsage(THREE.DynamicDrawUsage);
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', linkPos);
    const links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color: PALETTE.sage }));
    links.frustumCulled = false;
    root.add(links);
    const arr = linkPos.array as Float32Array;
    const start = (k: number): number => 0.8 + k * 1.55;
    return {
      blocks: [hub, nodes, pulse],
      tick(t) {
        const c = cyc(t, P);
        const reset = c >= 13.6 ? smoothstep((c - 13.6) / 0.8) : 0;
        CAMPUSES.forEach(([x, z], i) => {
          let lit = EXISTING.includes(i) ? 1 : 0;
          let bounce = 0;
          const k = NEW_ORDER.indexOf(i);
          if (k >= 0) {
            const ta = start(k) + 0.9;
            lit = smoothstep((c - ta) / 0.5) * (1 - reset);
            if (c > ta && c < ta + 0.6) bounce = Math.sin(((c - ta) / 0.6) * Math.PI) * 0.12;
          }
          put(nodes, i, x, HY + bounce, z, lit > 0.5 ? C.sage : C.bone2);
          const o = i * 6;
          arr[o] = 0;
          arr[o + 1] = HY;
          arr[o + 2] = 0;
          arr[o + 3] = x * lit;
          arr[o + 4] = HY;
          arr[o + 5] = z * lit;
        });
        nodes.commit();
        linkPos.needsUpdate = true;

        let shown = false;
        for (let k = 0; k < NEW_ORDER.length; k++) {
          const u = (c - start(k)) / 0.9;
          if (u < 0 || u >= 1) continue;
          const [x, z] = CAMPUSES[NEW_ORDER[k] ?? 0] ?? [0, 0];
          const q = smoothstep(u);
          put(pulse, 0, x * q, HY + Math.sin(u * Math.PI) * 0.25, z * q, C.ember);
          shown = true;
          break;
        }
        if (!shown) put(pulse, 0, 0, HY, 0, C.ember, 0.0001);
        pulse.commit();
      },
    };
  },
};

/**
 * Kappa Eta Kappa, Delta chapter: the chapter. One local chapter on a
 * hairline floor: a table slab at the centre, Ink 2 with Ember edges, and a
 * ring of member blocks around it, Bone 2 at rest. A roll call goes round
 * the table: an Ember pulse travels along the ring from the last seated
 * member to the next, and when it lands that member lights Sage with a small
 * bounce and a Sage hairline draws back to the member before. When the pulse
 * returns to the first seat the ring closes and the chapter is assembled.
 * It holds, goes quiet, and the roll call starts again.
 */
/** Seats around the table on the floor, x and z; the same list draws the static mark. */
const SEAT_N = 12;
const SEAT_RX = 1.9;
const SEAT_RZ = 0.8;
const seatAngle = (k: number): number => (k / SEAT_N) * Math.PI * 2;
const SEATS: Array<[number, number]> = Array.from({ length: SEAT_N }, (_, k): [number, number] => [
  Math.cos(seatAngle(k)) * SEAT_RX,
  Math.sin(seatAngle(k)) * SEAT_RZ,
]);

const kekDeltaPresident: RoleScene = {
  view: { rh: 2.7, rv: 1.0, yaw: 0.4, pitch: 0.5, target: v(0, 0, 0) },
  still: 6.7,
  build(root) {
    const FLOOR = -0.3;
    const P = 15;
    const HY = FLOOR + 0.08;
    const TY = FLOOR + 0.07;
    root.add(floorRect(-2.7, -1.3, 2.7, 1.3, FLOOR, PALETTE.line));
    const table = new Blocks(1, v(1.2, 0.14, 0.5), PALETTE.ember);
    put(table, 0, 0, TY, 0, C.ink2);
    table.commit();
    const seats = new Blocks(SEAT_N, 0.16, PALETTE.ink);
    const pulse = new Blocks(1, 0.08, PALETTE.ink);
    root.add(table.group, seats.group, pulse.group);
    const ringPos = new THREE.BufferAttribute(new Float32Array(SEAT_N * 6), 3);
    ringPos.setUsage(THREE.DynamicDrawUsage);
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', ringPos);
    const chords = new THREE.LineSegments(ringGeo, new THREE.LineBasicMaterial({ color: PALETTE.sage }));
    chords.frustumCulled = false;
    root.add(chords);
    const arr = ringPos.array as Float32Array;
    /** The pulse for seat k leaves at start(k) and lands 0.6 s later; k = SEAT_N is the closing leg back to seat 0. */
    const start = (k: number): number => 0.8 + k * 0.8;
    const land = (k: number): number => start(k) + 0.6;
    return {
      blocks: [table, seats, pulse],
      tick(t) {
        const c = cyc(t, P);
        const reset = c >= 13.6 ? smoothstep((c - 13.6) / 0.8) : 0;
        const closing = smoothstep((c - land(SEAT_N)) / 0.5) * (1 - reset);
        SEATS.forEach(([x, z], k) => {
          const ta = land(k);
          const lit = smoothstep((c - ta) / 0.5) * (1 - reset);
          const bounce = c > ta && c < ta + 0.6 ? Math.sin(((c - ta) / 0.6) * Math.PI) * 0.12 : 0;
          put(seats, k, x, HY + bounce, z, lit > 0.5 ? C.sage : C.bone2);
          // chord k joins seat k - 1 to seat k as seat k lights; chord 0 is the closing leg from the last seat
          const [px, pz] = SEATS[(k + SEAT_N - 1) % SEAT_N] ?? [0, 0];
          const draw = k === 0 ? closing : lit;
          const o = k * 6;
          arr[o] = px;
          arr[o + 1] = HY;
          arr[o + 2] = pz;
          arr[o + 3] = px + (x - px) * draw;
          arr[o + 4] = HY;
          arr[o + 5] = pz + (z - pz) * draw;
        });
        seats.commit();
        ringPos.needsUpdate = true;

        let shown = false;
        for (let k = 0; k <= SEAT_N; k++) {
          const u = (c - start(k)) / 0.6;
          if (u < 0 || u >= 1) continue;
          const q = smoothstep(u);
          const lift = HY + Math.sin(u * Math.PI) * 0.2;
          if (k === 0) {
            // the first call leaves the table for the first seat
            const [x, z] = SEATS[0] ?? [0, 0];
            put(pulse, 0, x * q, lift + (1 - q) * 0.12, z * q, C.ember);
          } else {
            // the rest travel along the ring from the seat before
            const a = seatAngle(k - 1) + (seatAngle(k) - seatAngle(k - 1)) * q;
            put(pulse, 0, Math.cos(a) * SEAT_RX, lift, Math.sin(a) * SEAT_RZ, C.ember);
          }
          shown = true;
          break;
        }
        if (!shown) put(pulse, 0, 0, HY, 0, C.ember, 0.0001);
        pulse.commit();
      },
    };
  },
};

const scenes: Record<string, RoleScene> = {
  thaw,
  eurofins,
  ece,
  'ai-lab': aiLab,
  hcl,
  'kek-vp': kekVp,
  'kek-delta-president': kekDeltaPresident,
};

export function mount(o: SceneOptions): Handle {
  const def = scenes[o.stage.dataset.role ?? ''];
  if (!def) {
    // an entry without a scene keeps its static drawing
    return { dispose() {} };
  }
  const stage = new Stage(o, def.view, def.still);
  const built = def.build(stage.root);
  stage.run((_dt, t) => {
    built.tick(t);
    stage.root.rotation.y = Math.sin(t * 0.25) * 0.04;
  });
  return {
    dispose() {
      stage.dispose(built.blocks);
    },
  };
}
