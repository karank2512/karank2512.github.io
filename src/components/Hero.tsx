import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { identity, links } from "../data/profile";
import Terminal from "./Terminal";
import Magnetic from "./Magnetic";
import { ArrowIcon, FileIcon, GithubIcon, LinkedinIcon, MailIcon } from "./icons";

function RotatingTarget() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const words = identity.targets;

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [reduce, words.length]);

  if (reduce) {
    return <span className="text-accent">{words[0]}</span>;
  }

  return (
    <span className="relative inline-grid">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[i]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="text-accent"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden">
      {/* technical grid + accent glow backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />
      <div className="glow pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 opacity-70" />

      <div className="relative mx-auto grid max-w-content grid-cols-1 items-center gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        {/* Left: identity */}
        <div>
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Open to {new Date().getFullYear()} new-grad roles
            </p>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {identity.name}
            </h1>

            <p className="mt-3 flex flex-wrap items-center gap-x-2 font-mono text-sm text-muted sm:text-base">
              building for <RotatingTarget />
            </p>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text/90">
              {identity.headline}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              {identity.oneLiner}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#work"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-[#06150f] transition-transform hover:-translate-y-0.5"
                >
                  View Projects <ArrowIcon width={16} height={16} />
                </a>
              </Magnetic>

              <a
                href={links.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-medium text-text transition-colors hover:border-accent/40 hover:text-accent"
              >
                <FileIcon width={16} height={16} /> Resume
              </a>

              <div className="flex items-center gap-1.5">
                {[
                  { href: links.github, label: "GitHub", Icon: GithubIcon },
                  { href: links.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
                  { href: `mailto:${links.email}`, label: "Email", Icon: MailIcon },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-panel text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <Icon width={18} height={18} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: terminal */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={reduce ? undefined : "animate-float"}
        >
          <Terminal />
        </motion.div>
      </div>
    </section>
  );
}
