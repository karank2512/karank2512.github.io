import { experience } from "../data/profile";
import Section from "./Section";
import Reveal from "./Reveal";

/** Experience as an F1 career: every seat is a race entry with season, team, and results. */
export default function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="sector 03 // racing history"
      title="Career results."
      intro="Every seat I've driven — from an open-source inference startup to a corporate compliance floor. Team, season, and what went on the board."
    >
      <div className="relative">
        {/* vertical rail */}
        <div className="absolute left-[13px] top-2 bottom-2 w-px bg-line sm:left-[15px]" aria-hidden />

        <ol className="space-y-10">
          {experience.map((job, i) => (
            <li key={`${job.org}-${i}`} className="relative pl-12 sm:pl-14">
              {/* race-entry marker */}
              <span
                className="absolute left-0 top-1 grid h-7 w-7 place-items-center rounded-md border border-accent/60 bg-ink font-mono text-[10px] font-bold text-accent sm:h-8 sm:w-8 sm:text-xs"
                aria-hidden
              >
                R{experience.length - i}
              </span>

              <Reveal delay={i * 0.04}>
                <div className="card overflow-hidden">
                  {/* season header — pit board style */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-panel2/60 px-5 py-2.5 sm:px-6">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                      Season {job.start} – {job.end}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {job.location}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent2">
                      Team · {job.org}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold text-text">{job.role}</h3>

                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      // race notes
                    </p>
                    <ul className="mt-2 space-y-2.5">
                      {job.bullets.map((b, bi) => (
                        <li key={bi} className="flex gap-3 text-sm leading-relaxed text-text/85">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
