"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import type { POI } from "@/components/POIMarker";

interface UseAutoScrollOptions {
    enabled: boolean;
    pointsOfInterest: POI[];
    totalFrames: number;
    triggerRef: React.RefObject<HTMLElement>;
    onPOIReveal?: (poi: POI) => void;
    onComplete?: () => void;
}

export function useAutoScroll({
    enabled,
    pointsOfInterest,
    totalFrames,
    triggerRef,
    onPOIReveal,
    onComplete,
}: UseAutoScrollOptions) {
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const [currentPOIIndex, setCurrentPOIIndex] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState<"normal" | "slow" | "paused">("paused");

    const pauseAutoScroll = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.pause();
            setIsRunning(false);
            setSpeed("paused");
        }
    }, []);

    const resumeAutoScroll = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.play();
            setIsRunning(true);
            setSpeed("normal");
        }
    }, []);

    const skipToNextPOI = useCallback(() => {
        if (currentPOIIndex < pointsOfInterest.length - 1) {
            setCurrentPOIIndex(currentPOIIndex + 1);
        }
    }, [currentPOIIndex, pointsOfInterest.length]);

    useEffect(() => {
        if (!enabled || !triggerRef.current) {
            if (timelineRef.current) {
                timelineRef.current.kill();
                timelineRef.current = null;
            }
            setIsRunning(false);
            setSpeed("paused");
            return;
        }

        const trigger = triggerRef.current;
        const triggerTop = trigger.offsetTop;
        const triggerHeight = trigger.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Kill existing timeline
        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        // Create new timeline
        const tl = gsap.timeline({
            onComplete: () => {
                setIsRunning(false);
                setSpeed("paused");
                onComplete?.();
            },
        });

        // Sort POIs by start time
        const sortedPOIs = [...pointsOfInterest].sort((a, b) => a.startFrameNo - b.startFrameNo);

        let currentScrollPosition = window.scrollY;

        sortedPOIs.forEach((poi, index) => {
            // Calculate scroll position for this POI
            const poiProgress = ((poi.startFrameNo + poi.endFrameNo) / 2) / 100;
            const targetScroll = triggerTop + (triggerHeight * poiProgress) - viewportHeight / 2;

            // Normal speed segment (approach POI)
            const approachDistance = Math.max((targetScroll - currentScrollPosition) * 0.8, 100);
            const approachTarget = currentScrollPosition + approachDistance;

            tl.to(window, {
                scrollTo: approachTarget,
                duration: Math.max(approachDistance / 100, 2), // ~100px per second
                ease: "none",
                onStart: () => setSpeed("normal"),
            });

            // Slow down segment (arrive at POI)
            tl.to(window, {
                scrollTo: targetScroll,
                duration: 3,
                ease: "power2.out",
                onStart: () => {
                    setSpeed("slow");
                    setCurrentPOIIndex(index);
                },
                onComplete: () => {
                    // Reveal POI
                    onPOIReveal?.(poi);
                },
            });

            // Pause at POI
            tl.to({}, { duration: 3 }); // 3 second pause

            currentScrollPosition = targetScroll;
        });

        // Final scroll to end
        const finalScroll = triggerTop + triggerHeight - viewportHeight;
        tl.to(window, {
            scrollTo: finalScroll,
            duration: 5,
            ease: "power2.inOut",
            onStart: () => setSpeed("normal"),
        });

        timelineRef.current = tl;
        setIsRunning(true);

        // Detect manual scroll to pause auto-scroll
        let scrollTimeout: NodeJS.Timeout;
        const handleManualScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // If user is manually scrolling, pause auto-scroll
                if (isRunning && !tl.isActive()) {
                    pauseAutoScroll();
                }
            }, 150);
        };

        window.addEventListener("wheel", handleManualScroll, { passive: true });
        window.addEventListener("touchmove", handleManualScroll, { passive: true });

        return () => {
            clearTimeout(scrollTimeout);
            window.removeEventListener("wheel", handleManualScroll);
            window.removeEventListener("touchmove", handleManualScroll);
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
        };
    }, [enabled, pointsOfInterest, totalFrames, triggerRef, onPOIReveal, onComplete]);

    return {
        isRunning,
        speed,
        currentPOIIndex,
        pause: pauseAutoScroll,
        resume: resumeAutoScroll,
        skipToNext: skipToNextPOI,
    };
}
