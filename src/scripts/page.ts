/**
 * The page script, the only JavaScript that loads with the page. It toggles
 * classes, creates the Spotify iframe on demand, drives the tour captions
 * from scroll, and imports a scene chunk when its canvas nears the viewport.
 * three.js is never imported here; it arrives with the scene chunks.
 */
import { hasWebGL, near, reducedMotion, whenIdle } from '../scenes/boot';

const reduced = reducedMotion();
const byId = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;

// 1. Pause the looping CSS animations in the hero (background field, sound
//    bars) when the hero is off screen or the tab is hidden.
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

// 3. Sound. Two buttons (HUD and touch) share one state. The iframe exists
//    only while sound is on; removing it is the only reliable way to stop
//    the audio. Once the strip has opened, bring the player into view.
const sndButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button.snd'));
const slot = byId('emb');
const sleeve = byId('sleeve');
if (sndButtons.length > 0 && slot) {
  let on = false;
  const setSound = (next: boolean): void => {
    on = next;
    for (const b of sndButtons) b.setAttribute('aria-pressed', String(on));
    document.body.classList.toggle('on', on);
    if (!on) {
      slot.replaceChildren();
      return;
    }
    const src = sndButtons[0];
    const frame = document.createElement('iframe');
    frame.src = src?.dataset.embedSrc ?? '';
    frame.title = src?.dataset.embedTitle ?? 'Spotify playlist';
    frame.width = '100%';
    frame.height = '352';
    frame.loading = 'lazy';
    frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    slot.replaceChildren(frame);
  };
  for (const b of sndButtons) b.addEventListener('click', () => setSound(!on));
  sleeve?.addEventListener('transitionend', (e) => {
    if (on && e.target === sleeve) sleeve.scrollIntoView({ block: 'nearest' });
  });
}

// 4. The tour: scroll position picks the caption and, once the scene is
//    there, the camera view. Native scrolling, nothing is hijacked.
const tour = byId('tour');
const stick = byId('tour-stick');
const tourStage = byId('tour-stage');
const tourCanvas = byId<HTMLCanvasElement>('tour-gl');
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
  tourUpdate();
}

// 5. The scenes. One WebGL probe for the page; software rasterizers count as
//    no WebGL and keep the static drawings. Every scene chunk is imported
//    only when its stage is near the viewport. The hero also waits for an
//    idle moment so three.js never competes with first paint.
const gl = hasWebGL();
const stage = byId('stage');
const heroCanvas = byId<HTMLCanvasElement>('hero-gl');
if (gl && stage && heroCanvas) {
  near(stage, () =>
    whenIdle(async () => {
      const { mountHero } = await import('../scenes/hero');
      const scene = mountHero({
        canvas: heroCanvas,
        stage,
        forkButton,
        reduced,
        onFirstFrame: () => stage.classList.add('is-3d'),
      });
      window.addEventListener('pagehide', () => scene.dispose(), { once: true });
    }),
  );
}

if (gl && tour && tourStage && tourCanvas) {
  near(tour, async () => {
    const { mountTour } = await import('../scenes/tour');
    const handle = mountTour({
      canvas: tourCanvas,
      stage: tourStage,
      reduced,
      onFirstFrame: () => tourStage.classList.add('is-3d'),
    });
    tourScene = handle;
    tourUpdate?.();
    window.addEventListener('pagehide', () => handle.dispose(), { once: true });
  });
}

// The cards are HTML and already laid out by CSS. Near the viewport, the
// small motion module takes over (drift, tilt, lift); with WebGL, the
// backdrop chunk draws the floor and a wire frame around each card.
const deck = byId('deck');
const deckCanvas = byId<HTMLCanvasElement>('deck-gl');
if (deck) {
  const slots = Array.from(deck.querySelectorAll<HTMLElement>('.slot'));
  near(deck, async () => {
    const { mountCards } = await import('../scenes/cards');
    const state = mountCards(deck, slots, reduced);
    deck.classList.add('live');
    let backdrop: { dispose(): void } | null = null;
    if (gl && deckCanvas) {
      const { mountCardsGl } = await import('../scenes/cardsGl');
      backdrop = mountCardsGl(deckCanvas, state);
      deckCanvas.classList.add('on');
    }
    window.addEventListener(
      'pagehide',
      () => {
        backdrop?.dispose();
        state.dispose();
      },
      { once: true },
    );
  });
}
