import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { terminalCommands } from "../data/profile";

type Line = { cmd: string; out: string };

const TYPE_MS = 42; // per-character typing speed
const OUTPUT_PAUSE = 650; // pause before showing output
const NEXT_PAUSE = 1500; // pause before next command
const MAX_VISIBLE = 4; // keep the terminal from growing forever

/**
 * A faux terminal that "types" rotating system commands and prints results.
 * Reduced-motion users get the same content rendered statically.
 */
export default function Terminal() {
  const reduce = useReducedMotion();
  const [history, setHistory] = useState<Line[]>([]);
  const [typed, setTyped] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const indexRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (reduce) return;
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.current.push(id);
    };

    const runCommand = () => {
      const current = terminalCommands[indexRef.current];
      let charIndex = 0;

      const typeChar = () => {
        charIndex += 1;
        setTyped(current.cmd.slice(0, charIndex));
        if (charIndex < current.cmd.length) {
          schedule(typeChar, TYPE_MS);
        } else {
          // finished typing -> show output
          schedule(() => {
            setShowOutput(true);
            // commit line to history, advance, reset
            schedule(() => {
              setHistory((h) => [...h, current].slice(-MAX_VISIBLE));
              setTyped("");
              setShowOutput(false);
              indexRef.current = (indexRef.current + 1) % terminalCommands.length;
              runCommand();
            }, NEXT_PAUSE);
          }, OUTPUT_PAUSE);
        }
      };

      typeChar();
    };

    runCommand();
    return () => {
      timers.current.forEach((id) => clearTimeout(id));
      timers.current = [];
    };
  }, [reduce]);

  return (
    <div className="card overflow-hidden shadow-2xl shadow-black/40">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-muted">karan@madison ~ %</span>
      </div>

      {/* body */}
      <div className="min-h-[15rem] space-y-2 p-4 font-mono text-[13px] leading-relaxed sm:text-sm">
        {reduce ? (
          // Static fallback
          terminalCommands.map((line) => (
            <div key={line.cmd}>
              <p>
                <span className="text-accent">❯</span> <span className="text-text">{line.cmd}</span>
              </p>
              <p className="text-muted">{line.out}</p>
            </div>
          ))
        ) : (
          <>
            {history.map((line, i) => (
              <div key={`${line.cmd}-${i}`}>
                <p>
                  <span className="text-accent">❯</span> <span className="text-text">{line.cmd}</span>
                </p>
                <p className="text-muted">{line.out}</p>
              </div>
            ))}
            {/* active line */}
            <div>
              <p>
                <span className="text-accent">❯</span> <span className="text-text">{typed}</span>
                <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent align-middle animate-blink" />
              </p>
              {showOutput && (
                <p className="text-muted">{terminalCommands[indexRef.current].out}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
