import { useRef, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "../data/profile";
import { ArrowIcon, ExternalIcon } from "./icons";

/**
 * A project "case study" card with a cursor-tracking spotlight and a
 * tilt-on-hover effect. Degrades to a static card under reduced motion.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 0, active: false });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-6"
    >
      {/* cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, rgba(91,233,198,0.10), transparent 70%)`,
        }}
      />

      <div className="relative flex flex-1 flex-col">
        {/* tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-bold tracking-tight text-text">{project.title}</h3>
        <p className="mt-2 text-sm font-medium text-accent/90">{project.blurb}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{project.detail}</p>

        {/* metrics */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {project.metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-line bg-ink/40 p-2.5">
              <div className="font-mono text-sm font-semibold text-text">{m.value}</div>
              <div className="mt-1 text-[10px] uppercase leading-tight tracking-wide text-muted">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* what it proves */}
        <p className="mt-5 border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-text/75">
          {project.proves}
        </p>

        <div className="mt-auto">
          {/* stack */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span key={s} className="font-mono text-[11px] text-muted">
                {s}
                <span className="px-1 text-line">/</span>
              </span>
            ))}
          </div>

          {/* links */}
          {project.links && project.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {project.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-text"
                >
                  {l.label}
                  {l.href.startsWith("http") ? (
                    <ExternalIcon width={14} height={14} />
                  ) : (
                    <ArrowIcon width={14} height={14} />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
