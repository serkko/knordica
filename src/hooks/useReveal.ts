import { useRef } from "react";
import { useInView } from "framer-motion";

export function useReveal(threshold = 0.15, once = true) {
  const ref = useRef<any>(null);
  const isInView = useInView(ref, { amount: threshold, once });

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return { ref, isInView, containerVariants, itemVariants };
}
