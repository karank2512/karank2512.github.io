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
      eyebrow="sector 01 // about"
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

        {/* F1 driver profile card + career telemetry */}
        <Reveal delay={0.1}>
          <div className="relative mb-5 overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="racing-stripe h-1 w-full" aria-hidden />

            {/* portrait with number overlay; square matches the source photo so nothing crops */}
            <div className="relative">
              <img
                src="./photos/driver-card.png"
                alt="Karan Kapur in a Red Bull Racing team suit"
                className="aspect-square w-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-panel via-transparent"
                aria-hidden
              />
              <span
                className="absolute right-4 top-2 font-display text-7xl font-black italic leading-none text-accent/90 drop-shadow-[0_2px_12px_rgba(6,10,20,0.8)]"
                aria-hidden
              >
                25
              </span>
              <div className="absolute bottom-3 left-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent2">
                  Driver profile
                </p>
                <p className="font-display text-2xl font-black uppercase tracking-wide text-text">
                  Karan <span className="text-accent">Kapur</span>
                </p>
              </div>
            </div>

            {/* spec sheet: F1 driver page style rows */}
            <dl className="divide-y divide-line border-t border-line">
              {[
                { k: "Team", v: "Free agent, 2026 silly season" },
                { k: "Seat", v: "AI/ML & Data Engineer" },
                { k: "Academy", v: "UW-Madison · CS + Data Science '26" },
                { k: "Base", v: identity.location },
                { k: "Status", v: "Actively exploring contracts with new teams" },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-baseline justify-between gap-4 px-5 py-2.5">
                  <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {k}
                  </dt>
                  <dd className="text-right text-sm font-medium text-text">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-accent2">
            // career telemetry
          </p>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {STATS.map((s, i) => (
              <div key={i} className="bg-panel p-5">
                <div className="font-mono text-2xl font-bold text-accent sm:text-3xl">{s.node}</div>
                <div className="mt-2 text-xs leading-snug text-muted">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-xs text-muted">
            // numbers from real shipped work, details in the timeline below.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
