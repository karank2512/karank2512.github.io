import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

/** Consistent section shell: anchor id, eyebrow label, heading, optional intro. */
export default function Section({ id, eyebrow, title, intro, children, className = "" }: Props) {
  return (
    <section id={id} className={`mx-auto w-full max-w-content px-5 py-20 sm:px-8 sm:py-28 ${className}`}>
      <Reveal>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{intro}</p>}
      </Reveal>
      <div className="mt-12">{children}</div>
    </section>
  );
}
