import { identity, hingePrompts, photos, type HingePrompt, type Photo } from "../../data/profile";
import Reveal from "../Reveal";
import FunNav from "./FunNav";
import FunWork from "./FunWork";
import FunLife from "./FunLife";
import FunContact from "./FunContact";
import { PhotoCard, PromptCard } from "./FunCards";

type FeedItem = { kind: "photo"; photo: Photo } | { kind: "prompt"; prompt: HingePrompt };

/** Alternate photo → prompt like a Hinge profile, appending any leftovers. */
function buildFeed(): FeedItem[] {
  const feed: FeedItem[] = [];
  const max = Math.max(photos.length, hingePrompts.length);
  for (let i = 0; i < max; i++) {
    if (photos[i]) feed.push({ kind: "photo", photo: photos[i] });
    if (hingePrompts[i]) feed.push({ kind: "prompt", prompt: hingePrompts[i] });
  }
  return feed;
}

const FEED = buildFeed();

const VITALS = [
  `📍 ${identity.location}`,
  "🎓 UW-Madison '26",
  "💼 Co-founder @ thaw",
  "🧠 AI/ML & Data",
  "✈️ Open to relocation",
];

/** Fun mode — the whole site as a Hinge-style profile. */
export default function FunProfile() {
  return (
    <div id="fun-top" className="min-h-screen bg-fun-bg font-funsans text-fun-ink">
      {/* Skip link for keyboard / screen-reader users */}
      <a
        href="#fun-work"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-fun-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to my work
      </a>

      <FunNav />

      <main className="mx-auto max-w-xl px-5 pb-16 pt-8 sm:pt-12">
        {/* profile header */}
        <Reveal>
          <p className="font-funsans text-xs font-bold uppercase tracking-[0.25em] text-fun-accent">
            Most compatible with: your team
          </p>
          <h1 className="mt-2 font-funserif text-4xl font-semibold tracking-tight sm:text-5xl">
            {identity.name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-fun-sub">
            {identity.oneLiner}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {VITALS.map((v) => (
              <span key={v} className="fun-chip">
                {v}
              </span>
            ))}
          </div>
        </Reveal>

        {/* the photo + prompt feed */}
        <div className="mt-8 space-y-5">
          {FEED.map((item, i) => (
            <Reveal key={item.kind === "photo" ? item.photo.src : item.prompt.prompt} delay={(i % 2) * 0.04}>
              {item.kind === "photo" ? <PhotoCard photo={item.photo} /> : <PromptCard item={item.prompt} />}
            </Reveal>
          ))}
        </div>

        <div className="mt-14 space-y-14">
          <FunWork />
          <FunLife />
          <FunContact />
        </div>
      </main>
    </div>
  );
}
