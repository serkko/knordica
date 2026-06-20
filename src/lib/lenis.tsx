"use client";
 
import { ReactLenis as Lenis, useLenis } from "@studio-freight/react-lenis";
export { useLenis };
 
export function ReactLenis({
    root,
    options,
    children,
}: {
    root?: boolean;
    options?: any;
    children: any;
}) {
    return (
        <Lenis root={root} options={options}>
            {children}
        </Lenis>
    );
}
