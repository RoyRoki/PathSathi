"use client";

import { useRef, useEffect } from "react";
import { MapPin, Clock, TrendingUp, Mountain } from "lucide-react";
import { gsap } from "@/lib/gsap";

interface FloatingStatsProps {
    distanceKm: number;
    durationHours: number;
    elevationGain?: number;
    totalPOIs?: number;
}

export function FloatingStats({
    distanceKm,
    durationHours,
    elevationGain = 2134,
    totalPOIs = 11,
}: FloatingStatsProps) {
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!statsRef.current) return;

        const stats = gsap.utils.toArray<HTMLElement>(".stat-card");

        // Entrance animation
        gsap.fromTo(
            stats,
            {
                y: 60,
                opacity: 0,
                scale: 0.9,
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.5)",
                delay: 0.5,
            }
        );

        // Floating animation loop
        stats.forEach((stat, index) => {
            gsap.to(stat, {
                y: "+=10",
                duration: 2 + index * 0.3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        });
    }, []);

    const stats = [
        {
            icon: MapPin,
            value: distanceKm,
            unit: "km",
            label: "Total Distance",
            gradient: "from-primary/20 to-primary/5",
            iconColor: "text-primary",
        },
        {
            icon: Clock,
            value: durationHours,
            unit: "hrs",
            label: "Journey Time",
            gradient: "from-accent/20 to-accent/5",
            iconColor: "text-accent",
        },
        {
            icon: TrendingUp,
            value: elevationGain,
            unit: "m",
            label: "Elevation Gain",
            gradient: "from-secondary/20 to-secondary/5",
            iconColor: "text-secondary",
        },
        {
            icon: Mountain,
            value: totalPOIs,
            unit: "POIs",
            label: "Points of Interest",
            gradient: "from-accent/20 to-accent/5",
            iconColor: "text-accent",
        },
    ];

    return (
        <div
            ref={statsRef}
            className="absolute bottom-0 left-0 w-full z-30 px-4 md:px-6 pb-24 md:pb-12" // Adjusted positioning and padding
        >
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="stat-card floating-stat-card group relative overflow-hidden rounded-xl md:rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 md:p-6 hover:shadow-3xl hover:border-white/20 hover:bg-black/30 transition-all duration-500" // Adjusted padding and radius
                    >
                        {/* Gradient background */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                        />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]" />

                        <div className="relative z-10 w-full">
                            {/* Icon */}
                            <div
                                className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl text-white bg-white/10 mb-3 md:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg backdrop-blur-sm`}
                            >
                                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                            </div>

                            {/* Value */}
                            <div className="mb-1 flex items-baseline flex-wrap">
                                <span className="text-2xl md:text-3xl font-bold text-white tabular-nums drop-shadow-lg">
                                    {stat.value}
                                </span>
                                <span className="text-sm md:text-lg text-white/80 ml-1 font-light">{stat.unit}</span>
                            </div>

                            {/* Label */}
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                                {stat.label}
                            </p>
                        </div>

                        {/* Corner accent */}
                        <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                ))}
            </div>
        </div>
    );
}
