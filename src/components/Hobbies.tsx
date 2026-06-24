import { motion, useReducedMotion } from "framer-motion";
import { hobbies } from "../data/profile";
import Section from "./Section";
import Reveal from "./Reveal";

export default function Hobbies() {
  const reduce = useReducedMotion();

  return (
    <Section
      id="life"
      eyebrow="05 / life outside the IDE"
      title="The stuff that makes the work make sense."
      intro="I’m better at building when I’m not only building. Here’s where the rest of the time goes."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hobbies.map((h, i) => (
          <Reveal key={h.title} delay={(i % 3) * 0.05}>
            <motion.div
              whileHover={reduce ? undefined : { y: -4, rotate: -0.4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-6"
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {h.emoji}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-text">{h.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{h.line}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
