"use client";

import { useRef, useEffect } from "react";
import { Play, Pause, SkipForward } from "lucide-react";
import { gsap } from "@/lib/gsap";
import type { POI } from "./POIMarker";

interface AutoScrollControlProps {
    isEnabled: boolean;
    isRunning: boolean;
    speed: "normal" | "slow" | "paused";
    currentPOI: POI | null;
    nextPOI: POI | null;
    onToggle: () => void;
    onPause: () => void;
    onResume: () => void;
    onSkip: () => void;
}

export function AutoScrollControl({
    isEnabled,
    isRunning,
    speed,
    currentPOI,
    nextPOI,
    onToggle,
    onPause,
    onResume,
    onSkip,
}: AutoScrollControlProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    // Entrance animation
    useEffect(() => {
        if (buttonRef.current) {
            gsap.fromTo(
                buttonRef.current,
                { y: -20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "back.out(1.5)",
                    delay: 1,
                }
            );
        }
    }, []);

    // Progress ring animation
    useEffect(() => {
        if (!progressRef.current) return;

        if (isRunning) {
            gsap.to(progressRef.current, {
                rotation: 360,
                duration: 2,
                repeat: -1,
                ease: "none",
            });
        } else {
            gsap.killTweensOf(progressRef.current);
        }
    }, [isRunning]);

    // Keyboard shortcut: Space to toggle
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === "Space" && e.target === document.body) {
                e.preventDefault();
                if (isEnabled && isRunning) {
                    onPause();
                } else if (isEnabled && !isRunning) {
                    onResume();
                } else {
                    onToggle();
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isEnabled, isRunning, onToggle, onPause, onResume]);

    const getSpeedLabel = () => {
        switch (speed) {
            case "normal":
                return "Cruising";
            case "slow":
                return "Arriving";
            case "paused":
                return "Paused";
        }
    };

    const getSpeedColor = () => {
        switch (speed) {
            case "normal":
                return "text-green-400";
            case "slow":
                return "text-amber-400";
            case "paused":
                return "text-white/50";
        }
    };

    return (
        <div className="fixed top-8 right-8 z-40 flex items-center gap-3">
            {/* Status Panel (when auto-scroll is active) */}
            {isEnabled && (
                <div className="hidden md:flex flex-col items-end gap-2 mr-2">
                    {/* Speed indicator */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-xl border border-white/10 shadow-xl">
                        <div className={`h-2 w-2 rounded-full ${speed !== "paused" ? "animate-pulse bg-accent" : "bg-white/30"}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${getSpeedColor()}`}>
                            {getSpeedLabel()}
                        </span>
                    </div>

                    {/* Current/Next POI */}
                    {(currentPOI || nextPOI) && (
                        <div className="px-4 py-2 rounded-xl bg-background/90 backdrop-blur-xl border border-white/10 shadow-xl max-w-xs">
                            {currentPOI && (
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                                            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5">
                                            At Location
                                        </p>
                                        <p className="text-xs font-medium text-white leading-tight">
                                            {currentPOI.header}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {nextPOI && !currentPOI && (
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <SkipForward className="h-4 w-4 text-white/50" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5">
                                            Next Stop
                                        </p>
                                        <p className="text-xs font-medium text-white/70 leading-tight">
                                            {nextPOI.header}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main Control Button */}
            <button
                ref={buttonRef}
                onClick={() => {
                    if (isEnabled) {
                        if (isRunning) {
                            onPause();
                        } else {
                            onResume();
                        }
                    } else {
                        onToggle();
                    }
                }}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 backdrop-blur-xl border-2 border-accent/50 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
                aria-label={isEnabled && isRunning ? "Pause auto-scroll" : "Start auto-scroll"}
            >
                {/* Progress ring */}
                {isRunning && (
                    <div
                        ref={progressRef}
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: "conic-gradient(from 0deg, transparent 270deg, rgba(255,255,255,0.5) 270deg)",
                        }}
                    />
                )}

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-accent/30 blur-xl group-hover:bg-accent/50 transition-all duration-300" />

                {/* Icon */}
                <div className="relative z-10">
                    {isEnabled && isRunning ? (
                        <Pause className="h-6 w-6 text-white fill-current" />
                    ) : (
                        <Play className="h-6 w-6 text-white fill-current ml-0.5" />
                    )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    <div className="bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap">
                        <span className="text-xs font-medium text-white">
                            {isEnabled && isRunning ? "Pause" : "Auto-Scroll"}
                            <span className="text-white/50 ml-2">(Space)</span>
                        </span>
                    </div>
                    <div className="h-2 w-2 bg-background/95 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
                </div>
            </button>

            {/* Skip Button (when auto-scroll is active) */}
            {isEnabled && nextPOI && (
                <button
                    onClick={onSkip}
                    className="group flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl hover:border-accent/50 transition-all duration-300"
                    aria-label="Skip to next POI"
                >
                    <SkipForward className="h-4 w-4 text-white/70 group-hover:text-accent transition-colors" />

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                        <div className="bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap">
                            <span className="text-xs font-medium text-white">Skip to Next</span>
                        </div>
                        <div className="h-2 w-2 bg-background/95 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
                    </div>
                </button>
            )}
        </div>
    );
}
