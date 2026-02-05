"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { Mountain, MapPin } from "lucide-react";

interface RouteProgressProps {
    progress: number; // 0-1
    currentFrame: number;
    totalFrames: number;
    distance?: number; // in km
    currentPOI?: string;
}

export function RouteProgress({
    progress,
    currentFrame,
    totalFrames,
    distance = 78,
    currentPOI,
}: RouteProgressProps) {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const currentDistanceRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (progressBarRef.current) {
            gsap.to(progressBarRef.current, {
                scaleX: progress,
                duration: 0.3,
                ease: "power2.out",
            });
        }

        if (currentDistanceRef.current) {
            const currentDist = (distance * progress).toFixed(1);
            gsap.to(currentDistanceRef.current, {
                textContent: currentDist,
                duration: 0.5,
                snap: { textContent: 0.1 },
                ease: "power2.out",
            });
        }
    }, [progress, distance]);

    const percentage = Math.round(progress * 100);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-6">
            <div className="relative rounded-2xl bg-background/80 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-50" />

                <div className="relative p-4">
                    {/* Top info row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                                <Mountain className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                                        Journey Progress
                                    </span>
                                    {currentPOI && (
                                        <>
                                            <div className="h-1 w-1 rounded-full bg-white/30" />
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-accent" />
                                                <span className="text-xs text-accent font-medium">
                                                    {currentPOI}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Distance counter */}
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white tabular-nums">
                                    <span ref={currentDistanceRef}>0.0</span>
                                    <span className="text-sm text-white/50 ml-1">/ {distance} km</span>
                                </div>
                            </div>

                            {/* Percentage */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border border-white/10">
                                <span className="text-sm font-bold text-white">
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"
                            style={{ animationDuration: "2s" }} />

                        {/* Actual progress */}
                        <div
                            ref={progressBarRef}
                            className="absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-r from-primary via-accent to-secondary shadow-lg"
                            style={{ transformOrigin: "left", transform: "scaleX(0)" }}
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50 blur-sm" />
                        </div>

                        {/* Progress indicator dot */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-2xl transition-all duration-300"
                            style={{
                                left: `${percentage}%`,
                                transform: `translateX(-50%) translateY(-50%) scale(${progress > 0 ? 1 : 0})`,
                            }}
                        >
                            <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
                        </div>
                    </div>

                    {/* Frame counter */}
                    <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                        <span>Frame {currentFrame} / {totalFrames}</span>
                        <span>Scroll to continue journey</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
