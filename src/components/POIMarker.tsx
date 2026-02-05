"use client";

import { useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { gsap } from "@/lib/gsap";

export interface POI {
    startTime: number;
    endTime: number;
    header: string;
    shortDescription: string;
}

interface POIMarkerProps {
    poi: POI;
    index: number;
    isActive: boolean;
    progress: number; // 0-1
}

export function POIMarker({ poi, index, isActive, progress }: POIMarkerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const markerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Calculate if this POI should be visible based on progress
    const totalDuration = 100; // Assuming normalized to 100
    const poiProgress = (poi.startTime + poi.endTime) / 2 / totalDuration;
    const shouldShow = Math.abs(progress - poiProgress) < 0.15; // Show when within 15% range

    const handleMouseEnter = () => {
        if (!markerRef.current) return;

        gsap.to(markerRef.current, {
            scale: 1.3,
            duration: 0.4,
            ease: "back.out(2)",
        });

        gsap.to(markerRef.current.querySelector(".poi-glow"), {
            opacity: 0.8,
            scale: 1.5,
            duration: 0.4,
            ease: "power2.out",
        });
    };

    const handleMouseLeave = () => {
        if (!markerRef.current) return;

        gsap.to(markerRef.current, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
        });

        gsap.to(markerRef.current.querySelector(".poi-glow"), {
            opacity: 0,
            scale: 1,
            duration: 0.3,
        });
    };

    const handleClick = () => {
        if (!tooltipRef.current) return;

        if (!isOpen) {
            setIsOpen(true);
            gsap.fromTo(
                tooltipRef.current,
                {
                    opacity: 0,
                    y: 20,
                    scale: 0.9,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: "back.out(1.5)",
                }
            );
        } else {
            gsap.to(tooltipRef.current, {
                opacity: 0,
                y: 10,
                scale: 0.95,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => setIsOpen(false),
            });
        }
    };

    if (!shouldShow) return null;

    return (
        <div
            ref={markerRef}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-30 cursor-pointer"
            style={{
                opacity: shouldShow ? 1 : 0,
                transition: "opacity 0.5s ease",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Glow effect */}
            <div className="poi-glow absolute inset-0 -z-10 opacity-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/60 via-accent/60 to-secondary/60 blur-xl" />
            </div>

            {/* Pulsing ring */}
            <div className="absolute inset-0 -z-5">
                <div
                    className="absolute inset-0 rounded-full border-2 border-accent/40 animate-ping"
                    style={{ animationDuration: "3s" }}
                />
            </div>

            {/* Main marker */}
            <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive
                    ? "bg-accent border-accent/50 shadow-2xl shadow-accent/50"
                    : "bg-background/90 border-white/30 backdrop-blur-lg"
                    }`}
            >
                <MapPin
                    className={`h-6 w-6 transition-colors ${isActive ? "text-white" : "text-accent"
                        }`}
                />

                {/* Badge number */}
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary shadow-lg">
                    {index + 1}
                </div>
            </div>

            {/* Tooltip */}
            {isOpen && (
                <div
                    ref={tooltipRef}
                    className="absolute left-full ml-6 top-1/2 -translate-y-1/2 w-80 max-w-[calc(100vw-8rem)] pointer-events-auto"
                >
                    <div className="relative rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
                        {/* Header gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-80" />

                        <div className="p-6">
                            {/* Close button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClick();
                                }}
                                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                            >
                                <X className="h-4 w-4 text-white/90" />
                            </button>

                            {/* Content */}
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 backdrop-blur-sm">
                                    <MapPin className="h-3.5 w-3.5 text-accent" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-accent drop-shadow-sm">
                                    Point of Interest #{index + 1}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 leading-tight drop-shadow-md">
                                {poi.header}
                            </h3>

                            <p className="text-sm text-white/90 leading-relaxed font-light">
                                {poi.shortDescription}
                            </p>

                            {/* Timing info */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-xs text-white/60 font-mono uppercase tracking-wide">
                                    <div className="flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                        <span>Journey Time: {poi.startTime}s - {poi.endTime}s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connecting line */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-6 h-px bg-gradient-to-r from-white/40 to-transparent" />
                </div>
            )}
        </div>
    );
}
