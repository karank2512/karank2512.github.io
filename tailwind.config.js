/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core surface palette — edit here to re-theme the whole site.
        ink: "#0A0B0D", // page background
        panel: "#121317", // cards / raised surfaces
        panel2: "#191B20", // hover / nested surfaces
        line: "#23262D", // borders / hairlines
        text: "#E7E8EA", // primary text
        muted: "#9A9CA3", // secondary text
        accent: "#5BE9C6", // primary accent (cool / systems)
        accent2: "#FFC65C", // secondary accent (warm / energy)
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
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
