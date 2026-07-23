import { hobbies, music } from "../../data/profile";
import Reveal from "../Reveal";
import { toEmbedUrl } from "../Music";

/** Hobbies as vitals chips + the playlist, fun-mode flavored. */
export default function FunLife() {
  const embed = toEmbedUrl(music.spotifyUrl, "auto");

  return (
    <section id="fun-life" aria-label="Life and music">
      <Reveal>
        <h2 className="font-funserif text-2xl font-semibold text-fun-ink sm:text-3xl">
          Weekend forecast
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {hobbies.map((h) => (
            <span key={h.title} className="fun-chip py-2 text-sm">
              <span aria-hidden>{h.emoji}</span> {h.title}
            </span>
          ))}
        </div>
      </Reveal>

      {embed && (
        <Reveal delay={0.06}>
          <div className="fun-card mt-6 overflow-hidden p-2">
            <iframe
              title="Spotify player"
              src={embed}
              width="100%"
              height="352"
              loading="lazy"
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ borderRadius: "18px" }}
            />
          </div>
          <p className="mt-3 text-center font-funsans text-xs font-semibold text-fun-sub">
            {music.caption}
          </p>
        </Reveal>
      )}
    </section>
  );
}
