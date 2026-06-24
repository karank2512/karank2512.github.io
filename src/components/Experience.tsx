import { experience } from "../data/profile";
import Section from "./Section";
import Reveal from "./Reveal";

export default function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="03 / experience"
      title="Where I’ve done the work."
      intro="From an open-source inference startup to a corporate compliance floor. A spread that taught me to build fast and account for the boring, important parts."
    >
      <div className="relative">
        {/* vertical rail */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line sm:left-[9px]" aria-hidden />

        <ol className="space-y-10">
          {experience.map((job, i) => (
            <li key={`${job.org}-${i}`} className="relative pl-8 sm:pl-10">
              {/* node */}
              <span className="absolute left-0 top-1.5 grid h-4 w-4 place-items-center sm:h-5 sm:w-5">
                <span className="h-4 w-4 rounded-full border-2 border-accent bg-ink sm:h-5 sm:w-5" />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-accent" />
              </span>

              <Reveal delay={i * 0.04}>
                <div className="card p-5 sm:p-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-lg font-semibold text-text">
                      {job.role}{" "}
                      <span className="text-muted">· {job.org}</span>
                    </h3>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {job.start} - {job.end}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted">{job.location}</p>

                  <ul className="mt-4 space-y-2.5">
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
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
