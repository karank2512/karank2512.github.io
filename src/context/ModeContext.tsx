import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Mode = "fun" | "serious";

const STORAGE_KEY = "portfolio-mode";

type ModeContextValue = {
  /** null = no choice yet → show the landing gate */
  mode: Mode | null;
  setMode: (mode: Mode) => void;
  /** clears the stored choice and returns the visitor to the gate */
  resetMode: () => void;
  /** true right after the visitor switches into serious mode → play the F1 start lights */
  startLights: boolean;
  dismissStartLights: () => void;
};

const ModeContext = createContext<ModeContextValue | null>(null);

function readStoredMode(): Mode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "fun" || v === "serious" ? v : null;
  } catch {
    return null;
  }
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode | null>(readStoredMode);
  const [startLights, setStartLights] = useState(false);

  // Keep <html data-mode> in sync so global CSS (body bg, selection…) follows.
  useEffect(() => {
    if (mode) {
      document.documentElement.dataset.mode = mode;
    } else {
      delete document.documentElement.dataset.mode;
    }
  }, [mode]);

  const setMode = useCallback(
    (next: Mode) => {
      // Entering serious mode gets the full grand-prix start sequence.
      if (next === "serious" && mode !== "serious") setStartLights(true);
      setModeState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private browsing; choice just won't persist */
      }
      // A mode switch is a fresh page, not a mid-scroll reskin.
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [mode]
  );

  const dismissStartLights = useCallback(() => setStartLights(false), []);

  const resetMode = useCallback(() => {
    setModeState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <ModeContext.Provider value={{ mode, setMode, resetMode, startLights, dismissStartLights }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside <ModeProvider>");
  return ctx;
}
