import { identity } from "../data/profile";
import { useMode } from "../context/ModeContext";

export default function Footer() {
  const { resetMode } = useMode();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row sm:px-8">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {identity.name}. Built with React, Tailwind &amp; Framer Motion.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={resetMode}
            className="font-mono text-xs text-muted transition-colors hover:text-accent"
          >
            change how you met me
          </button>
          <a href="#top" className="font-mono text-xs text-muted transition-colors hover:text-accent">
            back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
