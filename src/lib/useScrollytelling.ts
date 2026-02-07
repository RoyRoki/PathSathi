"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type UseScrollytellingOptions = {
  frameCount: number;
  getFrameSrc: (index: number) => string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  triggerRef: React.RefObject<HTMLElement>;
  scrub?: number;
  start?: string;
  end?: string;
  onFrameChange?: (index: number) => void;
  onProgress?: (progress: number) => void;
};

export function useScrollytelling({
  frameCount,
  getFrameSrc,
  canvasRef,
  triggerRef,
  scrub = 0.5,
  start = "top top",
  end,
  onFrameChange,
  onProgress
}: UseScrollytellingOptions) {
  // Store loaded images in a Map for quick access
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  // Track ongoing image requests to avoid duplicates
  const requestsRef = useRef<Set<number>>(new Set());

  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Track last successfully rendered frame to prevent flickering
  const lastRenderedFrameRef = useRef<number>(-1);

  // Buffer configuration
  const BUFFER_SIZE = 30; // Number of frames to keep loaded ahead/behind

  // Load a single frame
  const loadFrame = useCallback((index: number) => {
    if (index < 0 || index >= frameCount) return;
    if (imagesRef.current.has(index)) return; // Already loaded
    if (requestsRef.current.has(index)) return; // Already requested

    const img = new Image();
    requestsRef.current.add(index);

    img.src = getFrameSrc(index);

    img.onload = () => {
      imagesRef.current.set(index, img);
      requestsRef.current.delete(index);
    };

    img.onerror = () => {
      requestsRef.current.delete(index);
      // Optional: Retry logic could go here
    };
  }, [frameCount, getFrameSrc]);

  // Management of the frame buffer
  const updateBuffer = useCallback((targetFrame: number) => {
    // 1. Prioritize critical frames (immediate vicinity)
    const priorityRange = 5;
    for (let i = targetFrame - priorityRange; i <= targetFrame + priorityRange; i++) {
      loadFrame(i);
    }

    // 2. Load the wider buffer
    for (let i = 1; i <= BUFFER_SIZE; i++) {
      loadFrame(targetFrame + i); // Look ahead
      loadFrame(targetFrame - i); // Look behind
    }

    // 3. Cleanup far-away frames to manage memory
    if (imagesRef.current.size > BUFFER_SIZE * 4) { // Only clean if map gets too big
      for (const [key] of imagesRef.current) {
        if (Math.abs(key - targetFrame) > BUFFER_SIZE * 2) {
          imagesRef.current.delete(key);
        }
      }
    }
  }, [loadFrame]);

  // Render logic
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sizing logic - ensure high DPI sharpness
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Only resize if dimensions mistakenly change (optimization)
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    // Attempt to get the target frame
    let image = imagesRef.current.get(frameIndex);

    // FALLBACK: If target frame isn't ready, use the last successfully rendered one
    // This prevents "black flashes" during fast scrolls
    if (!image && lastRenderedFrameRef.current !== -1) {
      // Try to find the closest available frame? 
      // For performance, just stick to the last stable one.
      image = imagesRef.current.get(lastRenderedFrameRef.current);
    }

    if (!image || !image.complete || image.naturalWidth === 0) {
      return; // Nothing to draw yet
    }

    // Mark this as a successful render
    if (imagesRef.current.has(frameIndex)) {
      lastRenderedFrameRef.current = frameIndex;
    }

    // Draw Image 'Cover' Logic
    // We calculate this based on CSS logic essentially
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;

    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const x = (canvasWidth / 2) - (imgWidth / 2) * scale;
    const y = (canvasHeight / 2) - (imgHeight / 2) * scale;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(image, x, y, imgWidth * scale, imgHeight * scale);

  }, [canvasRef]);


  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    // Initial load of first few frames
    updateBuffer(0);

    const playhead = { frame: 0 };

    const timeline = gsap.to(playhead, {
      frame: frameCount - 1,
      ease: "none",
      onUpdate: () => {
        const frame = Math.round(playhead.frame);

        // Update functionality
        setCurrentFrame(frame);
        setProgress(frame / (frameCount - 1));

        // Trigger generic callbacks
        onFrameChange?.(frame);
        onProgress?.(frame / (frameCount - 1));

        // **Critical**: Drive the buffering and rendering
        updateBuffer(frame);
        renderFrame(frame);
      },
      scrollTrigger: {
        trigger,
        start,
        end: end ?? `+=${frameCount * 2}`, // Multiplier controls scroll speed feel
        scrub,
        pin: true,
        // invalidateOnRefresh: true, // Handle resize better
      }
    });

    return () => {
      timeline.kill();
    };
  }, [frameCount, triggerRef, updateBuffer, renderFrame, start, end, scrub, onFrameChange, onProgress]);


  // Handle resize events explicitly to keep canvas sharp
  useEffect(() => {
    const handleResize = () => {
      if (lastRenderedFrameRef.current !== -1) {
        renderFrame(lastRenderedFrameRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  return {
    currentFrame,
    progress
  };
}
