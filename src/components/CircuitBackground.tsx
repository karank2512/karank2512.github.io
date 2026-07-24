import { useEffect, useRef } from "react";

/**
 * A stylized Monaco-inspired circuit that sits behind the serious site.
 * As you scroll, the "car" (a glowing dot) laps the track and the completed
 * portion of the lap lights up in Red Bull red. Purely decorative.
 */

// Closed loop loosely following Monaco's shape: start/finish straight along the
// harbor, the climb to Casino, the Loews hairpin, the tunnel run, and the
// swimming-pool section back to the line.
const TRACK_PATH =
  "M 180 430 " +
  "C 320 470, 520 480, 660 455 " + // start/finish straight
  "C 760 437, 830 380, 845 300 " + // Sainte-Dévote + the climb
  "C 855 240, 810 200, 760 210 " + // Massenet
  "C 700 222, 665 200, 685 160 " + // Casino wiggle
  "C 705 120, 655 90, 610 105 " + // down to Mirabeau
  "C 570 118, 545 100, 560 75 " + // hairpin approach
  "C 572 55, 610 52, 618 72 " + // Loews hairpin
  "C 624 88, 600 100, 580 130 " + // hairpin exit
  "C 555 170, 500 200, 430 210 " + // Portier into the tunnel
  "C 330 225, 240 245, 180 280 " + // tunnel run
  "C 140 305, 130 340, 150 380 " + // chicane + Tabac
  "C 158 405, 168 418, 180 430 Z"; // swimming pool → Rascasse → line

export default function CircuitBackground() {
  const trackRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const progress = progressRef.current;
    const car = carRef.current;
    if (!track || !progress || !car) return;

    const total = track.getTotalLength();
    progress.style.strokeDasharray = String(total);
    progress.style.strokeDashoffset = String(total);

    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      const dist = p * total;
      const pt = track.getPointAtLength(dist);
      // steer the car along the track: angle of the tangent at this point
      const ahead = track.getPointAtLength(Math.min(dist + 2, total));
      const behind = track.getPointAtLength(Math.max(dist - 2, 0));
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      car.setAttribute("transform", `translate(${pt.x}, ${pt.y}) rotate(${angle})`);
      progress.style.strokeDashoffset = String(total * (1 - p));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <svg
        viewBox="0 0 1000 520"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        {/* track outline */}
        <path
          ref={trackRef}
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* centerline */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1.5}
          strokeDasharray="8 10"
        />
        {/* completed lap so far */}
        <path
          ref={progressRef}
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,59,92,0.28)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* start/finish line */}
        <line x1={180} y1={416} x2={180} y2={444} stroke="rgba(255,209,0,0.25)" strokeWidth={4} strokeDasharray="4 4" />
        {/* the car: top-down F1 silhouette, nose pointing along the track */}
        <g ref={carRef}>
          <circle r={26} fill="rgba(255,209,0,0.10)" />
          <g opacity={0.95} transform="scale(1.45)">
            {/* tyres */}
            <rect x={-14} y={-10} width={7.5} height={5} rx={2.2} fill="#161c2c" stroke="rgba(255,255,255,0.3)" strokeWidth={0.6} />
            <rect x={-14} y={5} width={7.5} height={5} rx={2.2} fill="#161c2c" stroke="rgba(255,255,255,0.3)" strokeWidth={0.6} />
            <rect x={6.5} y={-9} width={6.5} height={4.5} rx={2} fill="#161c2c" stroke="rgba(255,255,255,0.3)" strokeWidth={0.6} />
            <rect x={6.5} y={4.5} width={6.5} height={4.5} rx={2} fill="#161c2c" stroke="rgba(255,255,255,0.3)" strokeWidth={0.6} />
            {/* rear wing */}
            <rect x={-19.5} y={-7} width={4} height={14} rx={1.2} fill="#FF3B5C" />
            {/* body */}
            <path
              d="M -16 -3.5 L -4 -4.8 L 6 -3.2 L 17.5 -1.3 L 17.5 1.3 L 6 3.2 L -4 4.8 L -16 3.5 Z"
              fill="#FFD100"
            />
            {/* front wing */}
            <rect x={15.5} y={-6.5} width={3.2} height={13} rx={1.2} fill="#FF3B5C" />
            {/* cockpit + halo */}
            <circle cx={-2.5} cy={0} r={2.4} fill="#0E1526" />
          </g>
        </g>
      </svg>
    </div>
  );
}
