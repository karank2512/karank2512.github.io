import { useMemo, useState } from "react";
import { projects } from "../data/profile";
import Section from "./Section";
import Reveal from "./Reveal";
import ProjectCard from "./ProjectCard";

// Build the filter list from the tags that actually appear in the data.
const ALL = "All";

export default function Projects() {
  const [filter, setFilter] = useState<string>(ALL);

  const filters = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [ALL, ...Array.from(set)];
  }, []);

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.tags.includes(filter))),
    [filter]
  );

  return (
    <Section
      id="work"
      eyebrow="02 / featured work"
      title="Things I’ve built and shipped."
      intro="A mix of low-level systems, real client data products, and sports/F1 analytics. Each one is a small case study: what it does, the numbers, and what it proves."
    >
      {/* tag filter */}
      <Reveal>
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-line bg-panel text-muted hover:text-text"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {visible.map((p, i) => (
          <Reveal key={p.title} delay={(i % 2) * 0.06}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
