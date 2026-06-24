import { contact, identity, links } from "../data/profile";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon } from "./icons";

const CHANNELS = [
  { label: "Email", value: links.email, href: `mailto:${links.email}`, Icon: MailIcon },
  { label: "LinkedIn", value: "in/karankapur5", href: links.linkedin, Icon: LinkedinIcon },
  { label: "GitHub", value: "karank2512", href: links.github, Icon: GithubIcon },
  { label: "Resume", value: "PDF download", href: links.resume, Icon: FileIcon },
];

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="glow pointer-events-none absolute -bottom-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 opacity-60" />

      <div className="relative mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="section-eyebrow">07 / contact</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Let’s build something worth shipping.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {contact.closing}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a
                href={`mailto:${links.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-[#06150f] transition-transform hover:-translate-y-0.5"
              >
                <MailIcon width={18} height={18} /> {links.email}
              </a>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CHANNELS.map(({ label, value, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 rounded-2xl border border-line bg-panel p-4 transition-colors hover:border-accent/40"
              >
                <span className="text-muted transition-colors group-hover:text-accent">
                  <Icon width={20} height={20} />
                </span>
                <span className="text-sm font-medium text-text">{label}</span>
                <span className="truncate font-mono text-xs text-muted">{value}</span>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-10 font-mono text-xs text-muted">
            // based in {identity.location} · open to relocation
          </p>
        </Reveal>
      </div>
    </section>
  );
}
