import { links, projects } from "../../data/profile";
import Reveal from "../Reveal";
import { ExternalIcon, FileIcon } from "../icons";

/**
 * "My work, but make it casual": light project cards for fun mode.
 * Title + one-liner + link. The deep case studies live in serious mode.
 */
export default function FunWork() {
  const featured = projects.filter((p) => p.featured);

  return (
    <section id="fun-work" aria-label="What I'm building">
      <Reveal>
        <h2 className="font-funserif text-2xl font-semibold text-fun-ink sm:text-3xl">
          Not just a pretty profile,
        </h2>
        <p className="mt-1 font-funsans text-sm font-semibold text-fun-sub">
          a few things I've actually built. Want the full nerd version? Hit serious mode. 🏎️
        </p>
      </Reveal>

      <div className="mt-6 space-y-4">
        {featured.map((p, i) => (
          <Reveal key={p.title} delay={(i % 2) * 0.05}>
            <div className="fun-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-funsans text-base font-extrabold text-fun-ink">{p.title}</h3>
                  <p className="mt-1.5 font-funsans text-sm leading-relaxed text-fun-sub">{p.blurb}</p>
                </div>
                {p.links?.[0] && (
                  <a
                    href={p.links[0].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.title}: ${p.links[0].label}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-fun-line text-fun-sub transition-colors hover:border-fun-accent hover:text-fun-accent"
                  >
                    <ExternalIcon width={16} height={16} />
                  </a>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="fun-chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.08}>
        <a
          href={links.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-fun-accent px-6 py-3.5 font-funsans text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <FileIcon width={16} height={16} /> The résumé (my most serious selfie)
        </a>
      </Reveal>
    </section>
  );
}
