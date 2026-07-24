import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HingePrompt, Photo } from "../../data/profile";
import { HeartIcon } from "../icons";

/** Hinge-style like button, purely for fun; fills rose when tapped. */
function LikeButton({ label }: { label: string }) {
  const [liked, setLiked] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => setLiked((v) => !v)}
      whileTap={reduce ? undefined : { scale: 1.25 }}
      aria-label={liked ? `Unlike ${label}` : `Like ${label}`}
      aria-pressed={liked}
      className={`grid h-12 w-12 place-items-center rounded-full border shadow-sm transition-colors ${
        liked
          ? "border-fun-accent bg-fun-accent text-white"
          : "border-fun-line bg-fun-card text-fun-accent hover:bg-fun-bg"
      }`}
    >
      <HeartIcon width={22} height={22} fill={liked ? "currentColor" : "none"} />
    </motion.button>
  );
}

/** A full-bleed profile photo card. Captioned photos get a footer bar; the rest keep it clean. */
export function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <figure className="fun-card relative overflow-hidden">
      <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
      {photo.caption ? (
        <figcaption className="flex items-center justify-between gap-4 p-4">
          <span className="font-funsans text-sm font-semibold text-fun-sub">{photo.caption}</span>
          <LikeButton label={`photo: ${photo.caption}`} />
        </figcaption>
      ) : (
        <div className="absolute bottom-3 right-3">
          <LikeButton label={`photo: ${photo.alt}`} />
        </div>
      )}
    </figure>
  );
}

/** A Hinge prompt card: small label, big serif answer, like button. */
export function PromptCard({ item }: { item: HingePrompt }) {
  return (
    <div className="fun-card p-6 sm:p-7">
      <p className="font-funsans text-xs font-bold uppercase tracking-wider text-fun-sub">
        {item.prompt}
      </p>
      <p className="mt-3 font-funserif text-2xl font-medium leading-snug text-fun-ink sm:text-[1.7rem]">
        {item.answer}
      </p>
      <div className="mt-5 flex justify-end">
        <LikeButton label={`prompt: ${item.prompt}`} />
      </div>
    </div>
  );
}
