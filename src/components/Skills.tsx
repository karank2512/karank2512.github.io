import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { languages, skillGroups } from "../data/profile";
import Section from "./Section";
import Reveal from "./Reveal";
import { ArrowIcon } from "./icons";

export default function Skills() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(skillGroups[0].id);
  const active = skillGroups.find((g) => g.id === activeId) ?? skillGroups[0];

  return (
    <Section
      id="skills"
      eyebrow="04 / skills"
      title="A technical playground."
      intro="Grouped by what they’re actually for. Pick a category to see which projects it powers."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => {
          const isActive = group.id === activeId;
          return (
            <Reveal key={group.id} delay={(i % 3) * 0.05}>
              <button
                type="button"
                onClick={() => setActiveId(group.id)}
                aria-pressed={isActive}
                className={`flex h-full w-full flex-col rounded-2xl border p-5 text-left transition-colors ${
                  isActive
                    ? "border-accent/50 bg-accent/[0.06]"
                    : "border-line bg-panel hover:border-line/80 hover:bg-panel2"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text">{group.title}</h3>
                  <span
                    className={`h-2 w-2 rounded-full transition-colors ${
                      isActive ? "bg-accent" : "bg-line"
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">{group.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {group.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-line bg-ink/40 px-2 py-1 font-mono text-[11px] text-text/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>

      {/* related projects panel */}
      <Reveal delay={0.05}>
        <div className="mt-6 rounded-2xl border border-line bg-panel p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              {active.title} lights up
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reduce ? undefined : { opacity: 0, y: 6 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex flex-wrap gap-2"
              >
                {active.related.map((title) => (
                  <a
                    key={title}
                    href="#work"
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    {title}
                    <ArrowIcon width={12} height={12} />
                  </a>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>

      {/* languages strip */}
      <Reveal delay={0.1}>
        <div className="mt-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">Languages</p>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <span key={l} className="chip text-text/80">
                {l}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
