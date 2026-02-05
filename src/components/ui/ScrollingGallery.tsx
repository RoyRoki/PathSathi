"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

interface ImageItem {
    src: string;
    alt: string;
}

const images: ImageItem[] = [
    { src: "/images/gallery_tea_estate_1770294480982.png", alt: "Tea Estate" },
    { src: "/images/gallery_monastery_interior_1770294497797.png", alt: "Monastery Interior" },
    { src: "/images/darjeeling_hero_bg_1770289408859.png", alt: "Himalayan Sunrise" },
    { src: "/images/mountain_road_journey_1770289426463.png", alt: "Winding Mountain Road" },
    { src: "/images/sikkim_monastery_1770289444287.png", alt: "Mountain Monastery" },
    { src: "/images/misty_mountains_subtle_1770290902389.png", alt: "Misty Peaks" },
];

export function ScrollingGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!trackRef.current) return;

        const track = trackRef.current;

        // Duplicate images for infinite scroll effect
        const items = gsap.utils.toArray(".gallery-item");
        const totalWidth = (items as any[]).reduce(
            (acc: number, item) => acc + (item as HTMLElement).offsetWidth + 24,
            0
        ); // 24px gap (gap-6)

        // Create smooth infinite scroll animation
        const animation = gsap.to(track, {
            x: `-=${totalWidth / 2}`,
            duration: 40, // Slower for better visual experience
            ease: "none",
            repeat: -1,
        });

        // Pause on hover for user interaction
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
        <div
            ref={containerRef}
            className="w-full overflow-hidden py-16 md:py-20 bg-gradient-to-b from-muted/30 via-background/50 to-muted/30 backdrop-blur-sm border-y border-border/50"
        >
            {/* Section header */}
            <div className="text-center mb-12 px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Discover the Journey
                </h2>
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                    Experience the breathtaking landscapes that await you
                </p>
            </div>

            {/* Scrolling gallery track */}
            <div
                ref={trackRef}
                className="flex gap-4 md:gap-6 whitespace-nowrap px-4"
                style={{ width: "max-content" }}
            >
                {/* Render twice for seamless infinite loop */}
                {[...images, ...images].map((image, index) => (
                    <div
                        key={index}
                        className="gallery-item relative w-[280px] md:w-[320px] lg:w-[350px] aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] group shrink-0 bg-muted"
                    >
                        {/* Image with proper loading */}
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 350px"
                            loading="lazy"
                        />

                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Text label with slide-up animation */}
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                            <p className="text-white font-semibold text-base md:text-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 drop-shadow-lg">
                                {image.alt}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
