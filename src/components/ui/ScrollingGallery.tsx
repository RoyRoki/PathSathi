"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { getAssetPath } from "@/lib/utils";
import dynamic from 'next/dynamic';
import '@dotlottie/react-player/dist/index.css';

const DotLottiePlayer = dynamic(
    () => import('@dotlottie/react-player').then((mod) => mod.DotLottiePlayer),
    { ssr: false }
);

interface ImageItem {
    src: string;
    alt: string;
}

const images: ImageItem[] = [
    { src: getAssetPath("/images/darjeeling_tea_garden.webp"), alt: "Darjeeling Tea Garden" },
    { src: getAssetPath("/images/darjeeling_tiger_hill.webp"), alt: "Tiger Hill Sunrise" },
    { src: getAssetPath("/images/sikkim_gurudongmar_lake.webp"), alt: "Gurudongmar Lake" },
    { src: getAssetPath("/images/darjeeling_batasia_loop.webp"), alt: "Batasia Loop" },
    { src: getAssetPath("/images/sikkim_yumthang_valley.webp"), alt: "Yumthang Valley" },
];

export function ScrollingGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    useGSAP(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        let isPaused = false;
        const speed = 1.0;

        const tick = () => {
            if (isPaused) return;

            container.scrollLeft += speed;
            if (container.scrollLeft >= (container.scrollWidth / 2)) {
                container.scrollLeft = 0;
            }

            // Update Progress
            // We use half the scrollWidth because of the duplicated content loop
            const totalScrollableWidth = container.scrollWidth / 2;
            const currentProgress = container.scrollLeft / totalScrollableWidth;
            setProgress(currentProgress);
        };

        gsap.ticker.add(tick);

        // Native scroll listener to update progress when manually scrolling
        const handleScroll = () => {
            const totalScrollableWidth = container.scrollWidth / 2;
            // Wrap progress interactions (if user scrolls past mid point manually?)
            // Simple version: just % of half width
            const currentProgress = (container.scrollLeft % totalScrollableWidth) / totalScrollableWidth;
            setProgress(currentProgress);
        };

        const pause = () => { isPaused = true; };
        const play = () => { isPaused = false; };

        container.addEventListener("scroll", handleScroll);
        container.addEventListener("mouseenter", pause);
        container.addEventListener("mouseleave", play);
        container.addEventListener("touchstart", pause, { passive: true });
        container.addEventListener("touchend", play);

        return () => {
            gsap.ticker.remove(tick);
            container.removeEventListener("scroll", handleScroll);
            container.removeEventListener("mouseenter", pause);
            container.removeEventListener("mouseleave", play);
            container.removeEventListener("touchstart", pause);
            container.removeEventListener("touchend", play);
        };

    }, { scope: containerRef });

    return (
        <div className="w-full py-16 md:pt-24 md:pb-8 relative group">
            <div
                ref={containerRef}
                className="w-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <div
                    ref={contentRef}
                    className="flex gap-4 md:gap-6 whitespace-nowrap px-4 md:px-0 min-w-max"
                >
                    {[...images, ...images, ...images, ...images].map((image, index) => (
                        <div
                            key={index}
                            className="gallery-item relative w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px] aspect-[3/4] rounded-xl overflow-hidden group/item shrink-0"
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                                sizes="(max-width: 768px) 280px, (max-width: 1024px) 380px, 420px"
                                loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-sm font-medium tracking-wide translate-y-2 opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-500">
                                    {image.alt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Road Track & Car Indicator */}
            <div className="relative max-w-md md:max-w-full mx-auto mt-10 md:mt-6 md:mb-0 h-10 px-6 md:px-12">
                {/* Road Line */}
                <div className="absolute top-1/2 left-6 right-6 md:left-12 md:right-12 h-0.5 bg-border rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-accent/30 w-full"
                        style={{ transform: `translateX(${(progress * 100) - 100}%)` }}
                    />
                    {/* Optional: dashed center line feel? or just verify plain line first */}
                </div>

                {/* Car */}
                <div
                    className="absolute w-24 h-24 transition-transform duration-75 ease-linear will-change-transform"
                    style={{
                        left: `${progress * 100}%`,
                        marginLeft: '-48px', // Center the 96px car (24 * 4 = 96px)
                        top: '-46px' // Move above the track
                    }}
                >
                    <DotLottiePlayer
                        src={getAssetPath("/images/car_animation.lottie")}
                        loop
                        autoplay
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
}
