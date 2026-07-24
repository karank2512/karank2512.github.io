import { motion, useReducedMotion } from "framer-motion";
import { identity, photos } from "../data/profile";
import { useMode } from "../context/ModeContext";
import { ArrowIcon } from "./icons";

/**
 * Full-viewport landing gate: pick how you want to meet Karan.
 * Left = Serious (F1 Red Bull), right = Fun (Hinge profile).
 */
export default function ModeGate() {
  const { setMode } = useMode();
  const reduce = useReducedMotion();

  return (
    <div className="fixed inset-0 z-[70] grid grid-rows-[auto_1fr] overflow-y-auto bg-ink">
      {/* header */}
      <motion.header
        initial={reduce ? undefined : { opacity: 0, y: -12 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pb-6 pt-10 text-center sm:pt-14"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">karankapur.com</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-5xl">
          {identity.name}
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Pick how you want to meet me. You can switch anytime.
        </p>
      </motion.header>

      {/* the two doors */}
      <div className="grid grid-cols-1 gap-4 px-4 pb-6 sm:px-6 md:grid-cols-2 md:gap-6 md:pb-10">
        {/* Serious: F1 Red Bull */}
        <motion.button
          type="button"
          onClick={() => setMode("serious")}
          initial={reduce ? undefined : { opacity: 0, x: -24 }}
          animate={reduce ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          whileHover={reduce ? undefined : { scale: 1.015 }}
          className="group relative flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-panel p-7 text-left sm:min-h-[20rem] sm:p-9"
        >
          <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="glow absolute -top-24 right-0 h-72 w-72" aria-hidden />
          <div className="racing-stripe absolute inset-x-0 top-0 h-1.5" aria-hidden />
          <span className="absolute right-6 top-6 font-display text-6xl font-black text-text/10 transition-colors group-hover:text-accent/20 sm:text-8xl">
            25
          </span>

          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              Serious · race mode
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">
              The engineer.
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Case studies, telemetry, and shipped systems. Full throttle, no small talk.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink transition-transform group-hover:-translate-y-0.5">
              Lights out <ArrowIcon width={16} height={16} />
            </span>
          </div>
        </motion.button>

        {/* Fun: Hinge profile */}
        <motion.button
          type="button"
          onClick={() => setMode("fun")}
          initial={reduce ? undefined : { opacity: 0, x: 24 }}
          animate={reduce ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          whileHover={reduce ? undefined : { scale: 1.015 }}
          className="group relative flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-3xl border border-fun-line bg-fun-bg p-7 text-left sm:min-h-[20rem] sm:p-9"
        >
          <span
            className="absolute right-6 top-6 text-6xl opacity-20 transition-opacity group-hover:opacity-50 sm:text-7xl"
            aria-hidden
          >
            💘
          </span>
          {/* tilted polaroid tease */}
          <img
            src={photos[1].src}
            alt=""
            aria-hidden
            className="absolute -right-8 bottom-16 hidden w-40 rotate-6 rounded-2xl border-4 border-fun-card object-cover shadow-lg transition-transform group-hover:rotate-3 sm:block"
          />

          <div className="relative">
            <p className="font-funsans text-xs font-bold uppercase tracking-[0.25em] text-fun-accent">
              Fun · profile mode
            </p>
            <h2 className="mt-3 font-funserif text-3xl font-semibold text-fun-ink sm:text-4xl">
              The human.
            </h2>
            <p className="mt-2 max-w-sm font-funsans text-sm leading-relaxed text-fun-sub">
              Photos, prompts, and green flags; like a dating profile, but the projects are real.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-fun-accent px-5 py-3 font-funsans text-sm font-bold text-white transition-transform group-hover:-translate-y-0.5">
              Open the profile <ArrowIcon width={16} height={16} />
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
