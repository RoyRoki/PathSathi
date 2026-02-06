"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { getAssetPath } from "@/lib/utils";

interface ImageItem {
    src: string;
    alt: string;
}

const images: ImageItem[] = [
    { src: getAssetPath("/images/premium-tea.png"), alt: "Tea Estate" },
    { src: getAssetPath("/images/luxury-monastery.png"), alt: "Monastery Interior" },
    { src: getAssetPath("/images/darjeeling_hero_bg_1770289408859.png"), alt: "Himalayan Sunrise" },
    { src: getAssetPath("/images/mountain_road_journey_1770289426463.png"), alt: "Winding Mountain Road" },
    { src: getAssetPath("/images/sikkim_monastery_1770289444287.png"), alt: "Mountain Monastery" },
    { src: getAssetPath("/images/dashboard-bg.png"), alt: "Misty Peaks" },
];

export function ScrollingGallery() {
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!trackRef.current) return;

        const track = trackRef.current;
        const items = gsap.utils.toArray<HTMLElement>(".gallery-item");
        const totalWidth = items.reduce(
            (acc, item) => acc + item.offsetWidth + 24,
            0
        );

        const animation = gsap.to(track, {
            x: `-=${totalWidth / 2}`,
            duration: 45,
            ease: "none",
            repeat: -1,
        });

        const handleMouseEnter = () => animation.pause();
        const handleMouseLeave = () => animation.play();

        track.addEventListener("mouseenter", handleMouseEnter);
        track.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            animation.kill();
            track.removeEventListener("mouseenter", handleMouseEnter);
            track.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <div className="w-full overflow-hidden py-16 md:py-24">
            <div
                ref={trackRef}
                className="flex gap-5 md:gap-6 whitespace-nowrap px-4"
                style={{ width: "max-content" }}
            >
                {[...images, ...images].map((image, index) => (
                    <div
                        key={index}
                        className="gallery-item relative w-[320px] md:w-[380px] lg:w-[420px] aspect-[3/4] rounded-xl overflow-hidden group shrink-0"
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 320px, (max-width: 1024px) 380px, 420px"
                            loading="lazy"
                        />
                        {/* Subtle gradient + label on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                            <p className="text-white text-sm font-medium tracking-wide translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                {image.alt}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
