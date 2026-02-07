"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    // Use a ref for hover state to avoid re-binding listeners constantly
    const isHovered = useRef(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        const text = textRef.current;
        if (!cursor || !text) return;

        // Hide default cursor
        document.body.style.cursor = 'none';

        // Move logic
        const moveCursor = (e: MouseEvent) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.15,
                ease: "power2.out"
            });
        };

        // Hover logic
        const checkHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over interactive/journey elements
            const isInteractive = target.closest('.route-card') ||
                target.closest('.gallery-item') ||
                target.closest('.journey-player-container');

            if (isInteractive && !isHovered.current) {
                isHovered.current = true;
                gsap.to(cursor, {
                    width: 80,
                    height: 80,
                    backgroundColor: '#ffffff',
                    mixBlendMode: 'difference',
                    duration: 0.3,
                    ease: "power2.out"
                });
                gsap.to(text, { opacity: 1, scale: 1, duration: 0.3 });
            } else if (!isInteractive && isHovered.current) {
                isHovered.current = false;
                gsap.to(cursor, {
                    width: 16,
                    height: 16,
                    backgroundColor: '#F97316', // Accent color
                    mixBlendMode: 'normal',
                    duration: 0.3,
                    ease: "power2.out"
                });
                gsap.to(text, { opacity: 0, scale: 0.5, duration: 0.3 });
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", checkHover);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", checkHover);
            document.body.style.cursor = 'auto';
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-4 h-4 rounded-full bg-accent pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden will-change-transform"
        >
            <span
                ref={textRef}
                className="text-[10px] font-bold text-black opacity-0 tracking-widest"
            >
                EXPLORE
            </span>
        </div>
    );
}
