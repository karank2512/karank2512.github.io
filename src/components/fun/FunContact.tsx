import { identity, links } from "../../data/profile";
import { useMode } from "../../context/ModeContext";
import Reveal from "../Reveal";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon } from "../icons";

/** "It's a match" closer card + fun footer. */
export default function FunContact() {
  const { resetMode, setMode } = useMode();

  return (
    <section id="fun-contact" aria-label="Contact">
      <Reveal>
        <div className="fun-card p-7 text-center sm:p-9">
          <span className="text-4xl" aria-hidden>
            💌
          </span>
          <h2 className="mt-3 font-funserif text-2xl font-semibold text-fun-ink sm:text-3xl">
            Consider this a like with a comment.
          </h2>
          <p className="mx-auto mt-2 max-w-sm font-funsans text-sm leading-relaxed text-fun-sub">
            Recruiter, teammate, or fellow F1 conspiracy theorist — my inbox is open.
          </p>

          <a
            href={`mailto:${links.email}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-fun-accent px-6 py-3.5 font-funsans text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <MailIcon width={16} height={16} /> {links.email}
          </a>

          <div className="mt-5 flex items-center justify-center gap-2">
            {[
              { href: links.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
              { href: links.github, label: "GitHub", Icon: GithubIcon },
              { href: links.resume, label: "Resume", Icon: FileIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-11 w-11 place-items-center rounded-full border border-fun-line bg-fun-bg text-fun-sub transition-colors hover:border-fun-accent hover:text-fun-accent"
              >
                <Icon width={18} height={18} />
              </a>
            ))}
          </div>

          <p className="mt-5 font-funsans text-xs font-semibold text-fun-sub">
            📍 {identity.location} · open to relocation
          </p>
        </div>
      </Reveal>

      <footer className="mt-10 flex flex-col items-center gap-2 pb-10 text-center">
        <button
          type="button"
          onClick={() => setMode("serious")}
          className="font-funsans text-sm font-bold text-fun-ink underline decoration-fun-accent decoration-2 underline-offset-4 transition-colors hover:text-fun-accent"
        >
          See the serious version instead 🏎️
        </button>
        <button
          type="button"
          onClick={resetMode}
          className="font-funsans text-xs font-semibold text-fun-sub transition-colors hover:text-fun-accent"
        >
          change how you met me
        </button>
        <p className="mt-2 font-funsans text-xs font-semibold text-fun-sub">
          © {new Date().getFullYear()} {identity.name}. No swiping required.
        </p>
      </footer>
    </section>
  );
}
