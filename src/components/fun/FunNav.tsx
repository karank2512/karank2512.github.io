import { links } from "../../data/profile";
import { useMode } from "../../context/ModeContext";
import { FileIcon } from "../icons";

/** Sticky top bar for fun mode: name, resume, and the switch back to serious. */
export default function FunNav() {
  const { setMode } = useMode();

  return (
    <header className="sticky top-0 z-50 border-b border-fun-line bg-fun-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-xl items-center justify-between px-5">
        <a href="#fun-top" className="flex items-center gap-2" aria-label="Back to top">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-fun-accent font-funsans text-sm font-bold text-white">
            K
          </span>
          <span className="font-funserif text-lg font-semibold text-fun-ink">Karan</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href={links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-fun-line bg-fun-card px-3.5 py-2 font-funsans text-sm font-bold text-fun-ink transition-colors hover:border-fun-accent hover:text-fun-accent"
          >
            <FileIcon width={15} height={15} /> Resume
          </a>
          <button
            type="button"
            onClick={() => setMode("serious")}
            className="inline-flex items-center gap-1.5 rounded-full bg-fun-ink px-3.5 py-2 font-funsans text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            title="Switch to the serious (F1) version"
          >
            <span aria-hidden>🏎️</span> Serious mode
          </button>
        </div>
      </nav>
    </header>
  );
}
