"use client";

import { useLenis } from "@/lib/lenis";

export const useSmartScroll = () => {
    const lenis = useLenis();

    const scrollTo = (href: string) => {
        if (!lenis) return;

        let targetPos = 0;

        // Handle Top of Page
        if (href === '#' || href === 'top' || href === 'body') {
            targetPos = 0;
        } else {
            // Remove hash if present
            const targetId = href.replace('#', '');
            const elem = document.getElementById(targetId);

            if (!elem) {
                // If element not found, standard fallback
                window.location.href = href;
                return;
            }

            const elemTop = elem.getBoundingClientRect().top + window.scrollY;
            const elemHeight = elem.getBoundingClientRect().height;
            const vh = window.innerHeight;

            // For the contact section: offset so the form panel is centered in viewport
            // For other sections: use a small top offset (-80px) to not hide behind nav
            if (targetId === 'contact') {
                // Scroll so that the section appears roughly centered (~25% offset from top)
                const centerOffset = Math.max(0, (vh * 0.18));
                targetPos = elemTop - centerOffset;
            } else if (elemHeight > vh * 1.5) {
                // Very tall sections — just bring the top to slightly below nav
                targetPos = elemTop - 80;
            } else {
                // Normal sections — try to center them vertically with a 15% top bias
                const centerOffset = Math.max(0, (vh - elemHeight) * 0.4);
                targetPos = elemTop - centerOffset;
            }
        }

        const currentPos = window.scrollY;
        const distance = Math.abs(targetPos - currentPos);

        // If distance is huge (>1500px), jump closer first ("Teleport")
        if (distance > 1500) {
            const jumpTarget = targetPos > currentPos
                ? targetPos - 600  // Coming from top, land 600px above
                : targetPos + 600; // Coming from bottom, land 600px below

            // @ts-ignore
            lenis.scrollTo(jumpTarget, { immediate: true });

            // Small timeout to allow render, then soft landing
            setTimeout(() => {
                // @ts-ignore
                lenis.scrollTo(targetPos, {
                    duration: 1.4,
                    easing: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
                });
            }, 50);
        } else {
            // Standard smooth scroll
            // @ts-ignore
            lenis.scrollTo(targetPos, {
                duration: 1.2,
                easing: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            });
        }
    };

    return { scrollTo };
};
