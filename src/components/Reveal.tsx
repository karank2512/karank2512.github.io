import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** how far it travels up while fading in */
  y?: number;
};

/**
 * Scroll-reveal wrapper. Fades + lifts content into view once.
 * Falls back to a plain div when the user prefers reduced motion.
 */
export default function Reveal({ children, className, delay = 0, y = 24 }: Props) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
