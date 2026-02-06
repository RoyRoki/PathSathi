"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { getAssetPath } from "@/lib/utils";

type POI = {
  startTime: number;
  endTime: number;
  header: string;
  shortDescription: string;
};

type JourneyPlayerProps = {
  assetFolder: string;
  mobileFrames: number;
  desktopFrames: number;
  pointsOfInterest?: POI[];
};

export function JourneyPlayer({
  assetFolder,
  mobileFrames,
  desktopFrames,
  pointsOfInterest = [],
}: JourneyPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [activePOI, setActivePOI] = useState<POI | null>(null);
  const [activePOIIndex, setActivePOIIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState(false);

  // Get route slug
  const routeSlug = assetFolder?.split("/")[0] || "siliguri-Kurseong-darjeeling";

  // Device-specific frame counts from route data
  const totalFrames = isMobile ? mobileFrames : desktopFrames;
  const devicePath = isMobile ? "mobile" : "desktop";

  useEffect(() => {
    // Detect device
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));

      // Calculate frame (1-based index)
      const frame = Math.max(1, Math.min(totalFrames, Math.floor(scrollProgress * totalFrames) + 1));
      setCurrentFrame(frame);

      // Check for active POI
      const progress = scrollProgress * 100;
      const poiIndex = pointsOfInterest.findIndex(
        (p) => progress >= p.startTime && progress <= p.endTime
      );
      if (poiIndex !== -1) {
        setActivePOI(pointsOfInterest[poiIndex]);
        setActivePOIIndex(poiIndex);
      } else {
        setActivePOI(null);
        setActivePOIIndex(-1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalFrames, pointsOfInterest]);

  const framePath = getAssetPath(`/routes/${routeSlug}/${devicePath}/frames/frame_${String(currentFrame).padStart(4, "0")}.webp`);

  const scrollProgress = currentFrame / totalFrames;

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      {/* Progress Bar */}
      <div className="sticky top-0 left-0 w-full h-0.5 bg-black/20 backdrop-blur-md z-50">
        <div
          className="h-full bg-[hsl(var(--accent))] shadow-[0_0_8px_hsl(var(--accent)/0.4)] transition-all duration-100"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black" style={{ marginTop: '-2px' }}>
        {/* Frame Display */}
        <div className="relative w-full h-full">
          <Image
            src={framePath}
            alt="Journey frame"
            fill
            className="object-cover"
            priority
            quality={100}
            unoptimized
          />
          {/* Vignette overlay */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.4)]" />
        </div>

        {/* POI Overlay - Alternating Positions */}
        {activePOI && (
          <div
            className={`absolute md:top-1/2 md:-translate-y-1/2 bottom-20 md:bottom-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ${activePOIIndex % 2 === 0 ? 'left-4 md:left-8' : 'right-4 md:right-8'
              }`}
          >
            <div className="w-72 md:w-80 bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/15 shadow-xl overflow-hidden">
              {/* Copper accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[hsl(var(--accent))]" />
              <h3 className="font-display text-base md:text-lg font-semibold text-white mb-1.5 md:mb-2 tracking-tight">
                {activePOI.header}
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-white/80 leading-snug">
                {activePOI.shortDescription}
              </p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
