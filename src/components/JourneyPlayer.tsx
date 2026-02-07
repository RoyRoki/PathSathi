"use client";

import { useRef, useMemo } from "react";
import { getAssetPath } from "@/lib/utils";
import { useScrollytelling } from "@/lib/useScrollytelling";

type POI = {
  startFrameNo: number;
  endFrameNo: number;
  header: string;
  shortDescription: string;
};

type JourneyPlayerProps = {
  assetFolder: string;
  mobileFrames: number;
  desktopFrames: number;
  pointsOfInterest?: POI[];
  isMobile: boolean;
  children?: React.ReactNode;
};

export function JourneyPlayer({
  assetFolder,
  mobileFrames,
  desktopFrames,
  pointsOfInterest = [],
  isMobile,
  children
}: JourneyPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const routeSlug = (assetFolder?.split("/")[0] || "siliguri-kurseong-darjeeling").toLowerCase();

  // Device-specific frame counts from route data
  const totalFrames = isMobile ? mobileFrames : desktopFrames;
  const devicePath = isMobile ? "mobile" : "desktop";

  const getFrameSrc = useMemo(() => {
    return (index: number) => getAssetPath(`/routes/${routeSlug}/${devicePath}/frames/frame_${String(index).padStart(4, "0")}.webp`);
  }, [routeSlug, devicePath]);

  const { currentFrame, progress } = useScrollytelling({
    frameCount: totalFrames,
    getFrameSrc,
    canvasRef,
    triggerRef: containerRef,
    // Increase scroll distance to slow down the animation relative to scroll speed
    // This makes it harder to "skip" frames by scrolling too fast
    end: `+=${totalFrames * 5}`,
    scrub: 0.5
  });

  // Calculate active POI based on current frame from hook
  const activePOIIndex = pointsOfInterest.findIndex(
    (p) => currentFrame >= p.startFrameNo && currentFrame <= p.endFrameNo
  );
  const activePOI = activePOIIndex !== -1 ? pointsOfInterest[activePOIIndex] : null;

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/20 z-50 pointer-events-none">
        <div
          className="h-full bg-[hsl(var(--accent))] shadow-[0_0_8px_hsl(var(--accent)/0.8)] transition-all duration-75 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover"
      />

      {/* Vignette overlay */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] z-10" />

      {/* POI Overlay - Alternating Positions */}
      {activePOI && (
        <div
          key={activePOI.header} // Force re-animation on change
          className={`fixed md:top-1/2 md:-translate-y-1/2 bottom-32 md:bottom-auto z-40 animate-in fade-in slide-in-from-bottom-8 duration-700 ${activePOIIndex % 2 === 0 ? 'left-6 md:left-12' : 'right-6 md:right-12'
            }`}
        >
          <div className="w-80 md:w-96 bg-black/30 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden group hover:bg-black/40 transition-colors">
            {/* Copper accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--accent))] to-transparent opacity-80" />

            <h3 className="font-display text-lg md:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[hsl(var(--accent))] transition-colors">
              {activePOI.header}
            </h3>
            <p className="text-sm md:text-base text-white/90 leading-relaxed font-light">
              {activePOI.shortDescription}
            </p>
          </div>
        </div>
      )}

      {/* End of Journey Content (Agency Info) */}
      <div
        className="fixed inset-0 z-30 flex items-center justify-center transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          opacity: progress > 0.96 ? 1 : 0,
          pointerEvents: progress > 0.96 ? 'auto' : 'none',
          backdropFilter: progress > 0.96 ? 'blur(20px) brightness(0.4)' : 'none'
        }}
      >
        <div className={`transition-transform duration-1000 ${progress > 0.96 ? 'translate-y-0' : 'translate-y-10'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
