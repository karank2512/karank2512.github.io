import { music } from "../data/profile";
import Section from "./Section";
import Reveal from "./Reveal";

/**
 * Turn a normal Spotify share link into an embeddable URL.
 * Accepts playlist / album / track / artist links. Returns null if unusable.
 */
function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    // already an embed link
    if (u.pathname.startsWith("/embed/")) return u.toString();
    const parts = u.pathname.split("/").filter(Boolean); // [type, id]
    if (parts.length < 2) return null;
    const [type, id] = parts;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}

export default function Music() {
  const embed = toEmbedUrl(music.spotifyUrl);

  return (
    <Section
      id="music"
      eyebrow="06 / on rotation"
      title="The soundtrack to the build."
      intro={music.caption}
    >
      <Reveal>
        {embed ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
            <iframe
              title="Spotify player"
              src={embed}
              width="100%"
              height="352"
              loading="lazy"
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ borderRadius: "12px" }}
            />
          </div>
        ) : (
          // Fallback / empty state when no playlist URL is configured.
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel px-6 py-16 text-center">
            <span className="text-4xl">🎧</span>
            <p className="mt-4 max-w-md text-base text-text/85">
              Playlist loading… in real life. Drop a Spotify link in{" "}
              <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-sm text-accent">
                profile.music.spotifyUrl
              </code>{" "}
              and this turns into a live player.
            </p>
            <p className="mt-2 font-mono text-xs text-muted">
              Spotify → playlist → Share → Copy link to playlist
            </p>
          </div>
        )}
      </Reveal>
    </Section>
  );
}
