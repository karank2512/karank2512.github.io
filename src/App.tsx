import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Hobbies from "./components/Hobbies";
import Music from "./components/Music";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CursorGlow from "./components/CursorGlow";
import CircuitBackground from "./components/CircuitBackground";
import ModeGate from "./components/ModeGate";
import StartLights from "./components/StartLights";
import FunProfile from "./components/fun/FunProfile";
import { ModeProvider, useMode } from "./context/ModeContext";

/** Serious mode: the F1/Red Bull engineering site. */
function SeriousSite() {
  return (
    <>
      {/* Skip link for keyboard / screen-reader users */}
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <CursorGlow />
      <CircuitBackground />
      <Nav />

      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Hobbies />
        <Music />
        <Contact />
      </main>

      <Footer />
    </>
  );
}

function Site() {
  const { mode, startLights, dismissStartLights } = useMode();

  if (!mode) return <ModeGate />;
  if (mode === "fun") return <FunProfile />;
  return (
    <>
      <SeriousSite />
      {/* race-start sequence overlays the site, then fades to reveal it */}
      {startLights && <StartLights onDone={dismissStartLights} />}
    </>
  );
}

export default function App() {
  return (
    <ModeProvider>
      <Site />
    </ModeProvider>
  );
}
