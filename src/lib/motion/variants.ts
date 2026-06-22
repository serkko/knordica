/**
 * @file Centralized Framer Motion variants and easing constants.
 *
 * Framer Motion v12 requires `ease` to be typed as a 4-tuple
 * `[number, number, number, number]`, not `number[]`.
 * Always use the exported constants here — never inline raw arrays.
 */
import type { Transition, Variants } from "framer-motion";

// ── Easing constants ─────────────────────────────────────────────
export const EASE_EXPO   = [0.16, 1, 0.3,  1]  as [number, number, number, number];
export const EASE_SMOOTH = [0.22, 1, 0.36, 1]  as [number, number, number, number];

// ── Shared transitions ───────────────────────────────────────────
export const springTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

// ── Stagger container ────────────────────────────────────────────
export function makeContainerVariants(stagger = 0.07, delay = 0.05): Variants {
  return {
    hidden: {},
    show:  { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:  { transition: { staggerChildren: 0.03, staggerDirection: -1 as -1 } },
  };
}

/** Standard stagger container — no initial opacity change on the wrapper */
export const containerVariants: Variants = makeContainerVariants();

/** Stagger container used by reveal/scroll-triggered sections */
export const sectionContainerVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

// ── Item variants ────────────────────────────────────────────────

/** Fade + slide up — fast (0.5 s, expo ease) */
export const itemVariantsFast: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: EASE_EXPO } as Transition,
  },
};

/** Fade + slide up — normal (0.6 s, expo ease) */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: EASE_EXPO } as Transition,
  },
};

/** Fade + slide up — normal, "visible" key instead of "show" */
export const itemVariantsVisible: Variants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_EXPO } as Transition },
};

/** Fade + slide left — for horizontal reveals */
export const itemVariantsLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_EXPO } as Transition },
};

/** For useReveal hook — slightly different smoothing */
export const revealContainerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1, y: 0,
    transition: {
      duration: 0.6, ease: EASE_SMOOTH,
      staggerChildren: 0.07, delayChildren: 0.05,
    } as Transition,
  },
};

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: EASE_SMOOTH } as Transition,
  },
};

// ── Grid card variants ───────────────────────────────────────────
export const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: EASE_EXPO } as Transition,
  },
  exit: {
    opacity: 0, y: -12, scale: 0.96,
    transition: { duration: 0.25, ease: "easeIn" } as Transition,
  },
};
