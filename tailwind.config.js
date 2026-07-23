/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Serious mode · F1 Red Bull livery ─────────────────────────
        ink: "#060A14", // page background (midnight navy)
        panel: "#0C1322", // cards / raised surfaces
        panel2: "#131C31", // hover / nested surfaces
        line: "#1D2942", // borders / hairlines
        text: "#EAEFF9", // primary text
        muted: "#8E9CB8", // secondary text
        accent: "#FFD100", // Red Bull yellow (primary accent)
        accent2: "#FF3B5C", // Red Bull red (secondary accent)

        // ── Fun mode · Hinge profile ───────────────────────────────────
        fun: {
          bg: "#FAF5EF", // warm paper background
          card: "#FFFFFF", // profile cards
          ink: "#2B2622", // primary text
          sub: "#7A6F66", // secondary text
          line: "#EBE2D8", // borders
          accent: "#E14F63", // rose / coral
          accent2: "#F4A83D", // warm amber
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        // Serious headings — racing-adjacent
        display: ["'Titillium Web'", "Inter", "ui-sans-serif", "sans-serif"],
        // Fun mode pairing
        funserif: ["Fraunces", "Georgia", "serif"],
        funsans: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
