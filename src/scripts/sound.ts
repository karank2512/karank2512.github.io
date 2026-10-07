/**
 * The sound control: one SoundCloud widget iframe, present but hidden,
 * driven by the two play buttons, Previous and Next. Nothing from SoundCloud
 * loads until the first press. That press creates the iframe with the first
 * track and auto_play on, synchronously inside the user's gesture (iOS starts
 * audio only from a tap), and fetches the widget API script at the same
 * time. From then on the API object plays, pauses and loads the next track
 * into the same iframe; tracks auto-advance in order and loop.
 *
 * Two states: `pressed` is what was asked for (play pressed and not paused
 * since; it is what aria-pressed and the open strip show), and `playing` is
 * what the widget reports through its own play and pause events. The
 * turntable, the disc icon and the "Playing" caption follow `playing` only.
 */

export interface Track {
  title: string;
  artist: string;
  url: string;
}

interface Sound {
  title?: string;
  permalink_url?: string;
  user?: { username?: string };
}

interface Widget {
  bind(event: string, listener: (data?: unknown) => void): void;
  play(): void;
  pause(): void;
  load(url: string, options: Record<string, unknown>): void;
  isPaused(cb: (paused: boolean) => void): void;
  getCurrentSound(cb: (sound: Sound | undefined) => void): void;
}

interface SC {
  Widget: ((el: HTMLIFrameElement) => Widget) & { Events: Record<string, string> };
}

const API = 'https://w.soundcloud.com/player/api.js';
const PLAYER = 'https://w.soundcloud.com/player/';

export interface SoundOptions {
  buttons: HTMLButtonElement[];
  prev: HTMLButtonElement | null;
  next: HTMLButtonElement | null;
  /** Where the widget iframe goes: present, hidden, inert. */
  mount: HTMLElement;
  /** The now-playing line and its parts. */
  line: HTMLElement;
  tracks: Track[];
  /** Called with the widget's real play state whenever it changes. */
  onPlaying(on: boolean): void;
}

export interface SoundHandle {
  /** The current track index, for tests and the scene. */
  readonly index: number;
}

function playerUrl(track: Track, autoPlay: boolean): string {
  const q = new URLSearchParams({
    url: track.url,
    auto_play: String(autoPlay),
    visual: 'false',
    show_artwork: 'false',
    show_comments: 'false',
    show_teaser: 'false',
    hide_related: 'true',
    buying: 'false',
    sharing: 'false',
    download: 'false',
  });
  return `${PLAYER}?${q.toString()}`;
}

let api: Promise<SC> | null = null;
/** Fetch the widget API once, on the first press. */
function loadApi(): Promise<SC> {
  if (!api) {
    api = new Promise<SC>((resolve, reject) => {
      const w = window as Window & { SC?: SC };
      if (w.SC?.Widget) {
        resolve(w.SC);
        return;
      }
      const s = document.createElement('script');
      s.src = API;
      s.async = true;
      s.onload = () => (w.SC?.Widget ? resolve(w.SC) : reject(new Error('SoundCloud API did not define SC.Widget')));
      s.onerror = () => {
        api = null;
        reject(new Error('SoundCloud API failed to load'));
      };
      document.head.append(s);
    });
  }
  return api;
}

export function mountSound(o: SoundOptions): SoundHandle {
  const { buttons, tracks, line } = o;
  const state = line.querySelector<HTMLElement>('.np-state');
  const title = line.querySelector<HTMLElement>('.np-title');
  const artist = line.querySelector<HTMLElement>('.np-artist');
  const link = line.querySelector<HTMLAnchorElement>('.np-link');

  let index = 0;
  let pressed = false;
  let playing = false;
  let frame: HTMLIFrameElement | null = null;
  let widget: Widget | null = null;

  const track = (): Track => tracks[index] as Track;

  const render = (): void => {
    for (const b of buttons) b.setAttribute('aria-pressed', String(pressed));
    // the strip opens with the player and stays open through a pause
    document.body.classList.toggle('on', frame !== null);
    document.body.classList.toggle('playing', playing);
    if (state) state.textContent = playing ? 'Now playing' : pressed ? 'Loading' : 'Paused';
  };

  const setPlaying = (on: boolean): void => {
    if (on === playing) return;
    playing = on;
    render();
    o.onPlaying(on);
  };

  /** The line from our own list; the widget's metadata, when it has any, replaces title and artist. */
  const showTrack = (t: Track, sound?: Sound): void => {
    if (title) title.textContent = sound?.title || t.title;
    if (artist) artist.textContent = sound?.user?.username || t.artist;
    if (link) link.href = sound?.permalink_url || t.url;
  };

  /** Read the widget's real state after it is ready or has loaded a track. */
  const sync = (): void => {
    if (!widget) return;
    const w = widget;
    w.getCurrentSound((sound) => showTrack(track(), sound));
    w.isPaused((paused) => {
      setPlaying(!paused);
      // the browser may have refused auto_play: ask once more
      if (paused && pressed) w.play();
    });
  };

  /** Load track i into the widget, wrapping round at both ends. */
  const go = (i: number, autoPlay: boolean): void => {
    if (!frame) return;
    index = ((i % tracks.length) + tracks.length) % tracks.length;
    showTrack(track());
    pressed = autoPlay || pressed;
    render();
    if (widget) {
      widget.load(track().url, { auto_play: autoPlay, callback: sync });
    } else {
      // the API has not arrived (or failed): reload the iframe itself
      frame.src = playerUrl(track(), autoPlay);
    }
  };

  const attach = (sc: SC): void => {
    if (!frame || widget) return;
    const w = sc.Widget(frame);
    widget = w;
    const E = sc.Widget.Events;
    w.bind(E.READY, sync);
    w.bind(E.PLAY, () => {
      pressed = true;
      setPlaying(true);
      render();
    });
    w.bind(E.PAUSE, () => {
      pressed = false;
      setPlaying(false);
      render();
    });
    w.bind(E.FINISH, () => go(index + 1, true));
    w.bind(E.ERROR, () => {
      pressed = false;
      setPlaying(false);
      render();
    });
  };

  const press = (): void => {
    if (!frame) {
      // first press: the iframe is created inside the gesture with auto_play on
      frame = document.createElement('iframe');
      frame.src = playerUrl(track(), true);
      frame.title = 'SoundCloud player';
      frame.width = '300';
      frame.height = '166';
      frame.allow = 'autoplay';
      frame.tabIndex = -1;
      o.mount.replaceChildren(frame);
      pressed = true;
      showTrack(track());
      render();
      loadApi().then(attach, () => {
        // no API, so no events: leave the iframe to play on its own
      });
      return;
    }
    pressed = !pressed;
    render();
    if (widget) {
      if (pressed) widget.play();
      else widget.pause();
    } else if (!pressed) {
      // the API never arrived; without it the only way to stop is to unload
      frame.src = 'about:blank';
      frame.remove();
      frame = null;
      setPlaying(false);
      render();
    }
  };

  for (const b of buttons) b.addEventListener('click', press);
  o.prev?.addEventListener('click', () => go(index - 1, true));
  o.next?.addEventListener('click', () => go(index + 1, true));

  return {
    get index() {
      return index;
    },
  };
}
