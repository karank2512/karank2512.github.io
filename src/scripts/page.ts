/**
 * The page script, the only JavaScript that loads with the page. It toggles
 * classes, runs the sound control (the SoundCloud widget, created on the
 * first press), drives the tour captions from scroll, and imports a scene
 * chunk when its canvas nears the viewport. three.js is never imported here;
 * it arrives with the scene chunks.
 */
import { hasWebGL, near, reducedMotion, whenIdle } from '../scenes/boot';
import { mountSound, type Track } from './sound';

const reduced = reducedMotion();
const byId = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;
const onHide = (fn: () => void): void => window.addEventListener('pagehide', fn, { once: true });

// 1. Pause the looping CSS animations in the hero (background field, sound
//    bars, the fallback disc) when the hero is off screen or the tab is hidden.
const hero = byId('hero');
if (hero) {
  let offscreen = false;
  const sync = (): void => {
    hero.classList.toggle('paused', offscreen || document.hidden);
  };
  new IntersectionObserver((entries) => {
    offscreen = !entries.some((e) => e.isIntersecting);
    sync();
  }).observe(hero);
  document.addEventListener('visibilitychange', sync);
}

// 2. The fork control works with or without the scene: pressed holds the
//    lattice forked; the scene reads aria-pressed each frame.
const forkButton = byId<HTMLButtonElement>('fork-btn');
if (forkButton) {
  forkButton.addEventListener('click', () => {
    const on = forkButton.getAttribute('aria-pressed') !== 'true';
    forkButton.setAttribute('aria-pressed', String(on));
    forkButton.textContent = on ? 'Reset' : 'Fork it';
  });
}

// 3. Sound. Two buttons (turntable and touch) share one state, kept by the
//    sound module: the SoundCloud widget iframe is created on the first
//    press, Previous and Next move through the tracks, and the turntable
//    scene, if loaded, follows the widget's real play and pause events.
//    Once the strip has opened, bring the player into view.
const sndButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button.snd'));
const widgetMount = byId('widget');
const npLine = byId('np');
const sleeve = byId('sleeve');
let soundPlaying = false;
let vinyl: { setPlaying(on: boolean): void } | null = null;
if (sndButtons.length > 0 && widgetMount && npLine) {
  let tracks: Track[] = [];
  try {
    tracks = JSON.parse(byId('snd-tracks')?.textContent ?? '[]') as Track[];
  } catch {
    tracks = [];
  }
  if (tracks.length > 0) {
    mountSound({
      buttons: sndButtons,
      prev: byId<HTMLButtonElement>('snd-prev'),
      next: byId<HTMLButtonElement>('snd-next'),
      mount: widgetMount,
      line: npLine,
      tracks,
      onPlaying: (on) => {
        soundPlaying = on;
        vinyl?.setPlaying(on);
      },
    });
    sleeve?.addEventListener('transitionend', (e) => {
      if (document.body.classList.contains('on') && e.target === sleeve) sleeve.scrollIntoView({ block: 'nearest' });
    });
  }
}

// 4. The tour, inside the thaw entry's disclosure: scroll position picks the
//    caption and, once the scene is there, the camera view. Native
//    scrolling, nothing is hijacked. Opening the disclosure recomputes.
const tour = byId('tour');
const stick = byId('tour-stick');
const tourStage = byId('tour-stage');
const tourCanvas = byId<HTMLCanvasElement>('tour-gl');
const tourMore = byId<HTMLDetailsElement>('tour-more');
const caps = Array.from(document.querySelectorAll<HTMLElement>('#tour-caps .cap'));
let tourScene: { setProgress(p: number): void } | null = null;
let tourUpdate: (() => void) | null = null;
if (tour && stick && caps.length > 0 && !reduced) {
  let active = 0;
  let queued = false;
  // 0 when the stage pins, 1 when the last caption is in place.
  const progress = (): number => {
    const r = tour.getBoundingClientRect();
    const travel = r.height - stick.clientHeight;
    return travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
  };
  tourUpdate = (): void => {
    queued = false;
    const p = progress();
    tourScene?.setProgress(p);
    const i = Math.round(p * (caps.length - 1));
    if (i !== active) {
      caps[active]?.classList.remove('on');
      caps[i]?.classList.add('on');
      active = i;
    }
  };
  const onScroll = (): void => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(tourUpdate as () => void);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  tourMore?.addEventListener('toggle', onScroll);
  tourUpdate();
}

// 5. The scenes. One WebGL probe for the page, taken lazily: creating a
//    WebGL context costs tens of milliseconds of main thread (the GPU process
//    has to answer), and this script runs before the first paint, so the
//    probe waits until the first stage asks for a scene, which is the hero
//    after an idle callback. Software rasterizers count as no WebGL and keep
//    the static drawings. Every scene chunk is imported only when its stage
//    is near the viewport. The hero and the turntable also wait for an idle
//    moment so three.js never competes with first paint.
let glProbe: boolean | null = null;
const gl = (): boolean => {
  if (glProbe === null) glProbe = hasWebGL();
  return glProbe;
};
const stage = byId('stage');
const heroCanvas = byId<HTMLCanvasElement>('hero-gl');
if (stage && heroCanvas) {
  near(stage, () =>
    whenIdle(async () => {
      if (!gl()) return;
      const { mountHero } = await import('../scenes/hero');
      const scene = mountHero({
        canvas: heroCanvas,
        stage,
        forkButton,
        reduced,
        onFirstFrame: () => stage.classList.add('is-3d'),
      });
      onHide(() => scene.dispose());
    }),
  );
}

// The turntable lives in the sound control for fine pointers; on touch and
// narrow screens that button is display: none and never nears the viewport.
const vinylStage = byId('vinyl-stage');
const vinylCanvas = byId<HTMLCanvasElement>('vinyl-gl');
if (vinylStage && vinylCanvas) {
  near(vinylStage, () =>
    whenIdle(async () => {
      if (!gl()) return;
      const { mountVinyl } = await import('../scenes/vinyl');
      const scene = mountVinyl({
        canvas: vinylCanvas,
        stage: vinylStage,
        reduced,
        playing: soundPlaying,
        onFirstFrame: () => vinylStage.classList.add('is-3d'),
      });
      vinyl = scene;
      onHide(() => scene.dispose());
    }),
  );
}

if (tour && tourStage && tourCanvas) {
  near(tour, async () => {
    if (!gl()) return;
    const { mountTour } = await import('../scenes/tour');
    const handle = mountTour({
      canvas: tourCanvas,
      stage: tourStage,
      reduced,
      onFirstFrame: () => tourStage.classList.add('is-3d'),
    });
    tourScene = handle;
    tourUpdate?.();
    onHide(() => handle.dispose());
  });
}

// The project cards are HTML and already laid out by CSS. Near the viewport,
// the small motion module takes over (drift, tilt, lift); with WebGL, the
// backdrop chunk draws the floor and a wire frame around each card, and each
// card's stage gets its own scene.
const deck = byId('deck');
const deckCanvas = byId<HTMLCanvasElement>('deck-gl');
if (deck) {
  const slots = Array.from(deck.querySelectorAll<HTMLElement>('.slot'));
  near(deck, async () => {
    const { mountCards } = await import('../scenes/cards');
    const state = mountCards(deck, slots, reduced);
    deck.classList.add('live');
    let backdrop: { dispose(): void } | null = null;
    if (deckCanvas && gl()) {
      const { mountCardsGl } = await import('../scenes/cardsGl');
      backdrop = mountCardsGl(deckCanvas, state);
      deckCanvas.classList.add('on');
    }
    onHide(() => {
      backdrop?.dispose();
      state.dispose();
    });
  });
}

// The card scenes, one chunk each, and the role scenes under Experience and
// Leadership, which share one chunk and pick their drawing from data-role.
const sceneLoaders: Record<string, () => Promise<{ mount: (o: SceneOpts) => { dispose(): void } }>> = {
  relayiq: () => import('../scenes/gate'),
  foreman: () => import('../scenes/agency'),
  tell: () => import('../scenes/field'),
  role: () => import('../scenes/roles'),
};
interface SceneOpts {
  canvas: HTMLCanvasElement;
  stage: HTMLElement;
  reduced: boolean;
  onFirstFrame: () => void;
}
for (const sceneStage of Array.from(document.querySelectorAll<HTMLElement>('.stage[data-scene]'))) {
  const load = sceneLoaders[sceneStage.dataset.scene ?? ''];
  const canvas = sceneStage.querySelector('canvas');
  if (!load || !canvas) continue;
  near(sceneStage, async () => {
    if (!gl()) return;
    const { mount } = await load();
    const scene = mount({ canvas, stage: sceneStage, reduced, onFirstFrame: () => sceneStage.classList.add('is-3d') });
    onHide(() => scene.dispose());
  });
}

// The role tiles are HTML windows beside each entry. Near the viewport the
// small tile module moves them (drift, tilt toward the pointer, lift on
// hover), with or without WebGL; the scene inside rides along. Under
// reduced motion they stay where CSS put them.
if (!reduced) {
  for (const tile of Array.from(document.querySelectorAll<HTMLElement>('.tile'))) {
    near(tile, async () => {
      const { mountTile } = await import('../scenes/tiles');
      onHide(mountTile(tile).dispose);
    });
  }
}
