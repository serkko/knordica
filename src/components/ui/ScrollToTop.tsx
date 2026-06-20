"use client";

import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useSmartScroll } from "@/hooks/useSmartScroll";
import { useLocale } from "@/components/layout/LocaleProvider";

export default function ScrollToTop() {
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);
    const { scrollTo } = useSmartScroll();
    const { locale } = useLocale();

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsVisible(latest > 500);
        });
    }, [scrollY]);

    const scrollToTop = () => {
        scrollTo("#");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed right-8 bottom-8 z-50 flex flex-col items-center gap-2">
                    <div className="group relative flex flex-col items-center">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            onClick={scrollToTop}
                            className="flex items-center justify-center bg-[var(--color-gold)] border border-[var(--color-gold-highlight)]/30 rounded-full text-[var(--color-text-inverse)] hover:bg-[var(--color-gold-hover)] hover:scale-105 transition-all duration-300 shadow-xl w-12 h-12 cursor-pointer"
                            aria-label={locale === "es" ? "Subir al inicio" : "Scroll to top"}
                        >
                            <ArrowUp size={20} />
                        </motion.button>

                        {/* Tooltip text floating above */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest text-[var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                            {locale === "es" ? "SUBIR" : "TOP"}
                        </span>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
