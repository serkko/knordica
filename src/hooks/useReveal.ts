import { useRef } from "react";
import { useInView } from "framer-motion";
import { revealContainerVariants, revealItemVariants } from "@/lib/motion/variants";

export function useReveal(threshold = 0.15, once = true) {
  const ref = useRef<any>(null);
  const isInView = useInView(ref, { amount: threshold, once });

  return {
    ref,
    isInView,
    containerVariants: revealContainerVariants,
    itemVariants: revealItemVariants,
  };
}
