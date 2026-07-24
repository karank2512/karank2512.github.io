import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const COLS = 5;
const FIRST_LIGHT_MS = 500; // beat of darkness before the first light
const LIGHT_INTERVAL_MS = 550; // gap between columns lighting up
const HOLD_MS = 900; // all five held red before lights out
const OUT_TEXT_MS = 900; // "away we go" moment
const FADE_MS = 600; // overlay fade into the site

/**
 * The F1 race-start sequence shown when entering serious mode:
 * five red light columns come on one by one, hold, then it's
 * lights out and away we go, fading into the site underneath.
 * Click anywhere to skip. Skipped entirely under reduced motion.
 */
export default function StartLights({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(0);
  const [out, setOut] = useState(false);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    if (reduce) {
      finish();
      return;
    }
    const timers: number[] = [];
    for (let i = 1; i <= COLS; i++) {
      timers.push(window.setTimeout(() => setLit(i), FIRST_LIGHT_MS + i * LIGHT_INTERVAL_MS));
    }
    const outAt = FIRST_LIGHT_MS + COLS * LIGHT_INTERVAL_MS + HOLD_MS;
    timers.push(window.setTimeout(() => setOut(true), outAt));
    timers.push(window.setTimeout(() => setFading(true), outAt + OUT_TEXT_MS));
    timers.push(window.setTimeout(finish, outAt + OUT_TEXT_MS + FADE_MS));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      role="presentation"
      onClick={finish}
      className={`fixed inset-0 z-[80] flex cursor-pointer flex-col items-center justify-center bg-ink transition-opacity ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* gantry bar */}
      <div className="w-[19rem] rounded-t-md bg-panel2 px-3 pb-3 pt-2 sm:w-[24rem]">
        <div className="racing-stripe mb-3 h-0.5 w-full opacity-60" aria-hidden />
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: COLS }, (_, col) => (
            <div key={col} className="flex flex-col items-center gap-2 rounded-md bg-ink/80 py-2.5">
              {Array.from({ length: 4 }, (_, row) => {
                const on = !out && col < lit && row >= 2; // bottom two bulbs go red, like the real gantry
                return (
                  <span
                    key={row}
                    className="h-8 w-8 rounded-full transition-colors duration-150 sm:h-10 sm:w-10"
                    style={{
                      background: on ? "#FF1801" : "#12182A",
                      boxShadow: on
                        ? "0 0 18px 4px rgba(255,24,1,0.55), inset 0 0 6px rgba(255,255,255,0.35)"
                        : "inset 0 2px 4px rgba(0,0,0,0.6)",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* gantry post */}
      <div className="h-16 w-1.5 bg-panel2 sm:h-20" aria-hidden />

      <p
        className={`mt-8 font-display text-lg font-bold uppercase tracking-[0.2em] transition-opacity duration-300 sm:text-2xl ${
          out ? "text-accent opacity-100" : "text-muted opacity-0"
        }`}
        aria-live="polite"
      >
        {out ? "It's lights out and away we go" : "…"}
      </p>
      <p className="mt-3 font-mono text-[11px] text-muted/70">click to skip formation lap</p>
    </div>
  );
}
