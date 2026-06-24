import { identity } from "../data/profile";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row sm:px-8">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {identity.name}. Built with React, Tailwind &amp; Framer Motion.
        </p>
        <a href="#top" className="font-mono text-xs text-muted transition-colors hover:text-accent">
          back to top ↑
        </a>
      </div>
    </footer>
  );
}
