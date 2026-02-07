"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const follower = followerRef.current;
        if (!cursor || !follower) return;

        const onMouseMove = (e: MouseEvent) => {
            // Direct positioning for the main dot
            gsap.set(cursor, {
                x: e.clientX,
                y: e.clientY,
            });

            // Smoother following for the outer circle
            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: "power3.out",
            });
        };

        const onMouseDown = () => {
            gsap.to([cursor, follower], { scale: 0.8, duration: 0.3 });
        };

        const onMouseUp = () => {
            gsap.to([cursor, follower], { scale: 1, duration: 0.3 });
        };

        const handleLinkHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                target.closest("a") ||
                target.closest("button") ||
                target.classList.contains("cursor-pointer")
            ) {
                gsap.to(follower, {
                    scale: 2,
                    backgroundColor: "rgba(var(--primary), 0.1)",
                    borderColor: "rgba(var(--primary), 0.5)",
                    duration: 0.3,
                });
            } else {
                gsap.to(follower, {
                    scale: 1,
                    backgroundColor: "transparent",
                    borderColor: "currentColor",
                    duration: 0.3,
                });
            }
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("mouseover", handleLinkHover);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mouseover", handleLinkHover);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary mix-blend-difference hidden md:block"
            />
            <div
                ref={followerRef}
                className="pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50 mix-blend-difference transition-colors duration-300 hidden md:block"
            />
        </>
    );
}
