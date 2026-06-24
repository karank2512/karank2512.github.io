import type { ReactNode } from "react";
import { about, identity } from "../data/profile";
import Section from "./Section";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

const STATS: { node: ReactNode; label: string }[] = [
  { node: <CountUp to={0.88} decimals={2} suffix="s" />, label: "median LLM fork on H100s" },
  { node: <CountUp to={14.3} decimals={1} suffix=" GB/s" />, label: "weight restore throughput" },
  { node: <CountUp to={1000} suffix="+" />, label: "IT tickets resolved" },
  { node: <CountUp to={98} suffix="%" />, label: "end-user satisfaction" },
];

export default function About() {
  return (
    <Section
      id="about"
      eyebrow="01 / about"
      title="Infrastructure meets insight."
      intro={identity.education}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {about.map((para, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="text-base leading-relaxed text-text/85 sm:text-lg">{para}</p>
            </Reveal>
          ))}
        </div>

        {/* by the numbers */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {STATS.map((s, i) => (
              <div key={i} className="bg-panel p-5">
                <div className="font-mono text-2xl font-bold text-accent sm:text-3xl">{s.node}</div>
                <div className="mt-2 text-xs leading-snug text-muted">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-xs text-muted">
            // numbers from real shipped work — details in the timeline below.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
