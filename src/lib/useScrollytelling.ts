"use client";

import { useEffect, useRef, useState } from "react";
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
  scrub = 0.8,
  start = "top top",
  end,
  onFrameChange,
  onProgress
}: UseScrollytellingOptions) {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frameCount <= 0) {
      return;
    }

    let mounted = true;
    const images = Array.from({ length: frameCount }, (_, index) => {
      const img = new Image();
      img.src = getFrameSrc(index);
      return img;
    });

    const preload = Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    preload.then(() => {
      if (!mounted) return;
      imagesRef.current = images;
      setReady(true);
      renderFrame(0);
    });

    return () => {
      mounted = false;
    };
  }, [canvasRef, frameCount, getFrameSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const trigger = triggerRef.current;

    if (!canvas || !trigger || !ready) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (prefersReduced) {
      renderFrame(0);
      return;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderFrame(0);
    };

    resize();
    window.addEventListener("resize", resize);

    const playhead = { frame: 0 };
    const timeline = gsap.to(playhead, {
      frame: frameCount - 1,
      ease: "none",
      onUpdate: () => {
        const frame = Math.round(playhead.frame);
        const prog = frame / (frameCount - 1);
        setProgress(prog);
        renderFrame(frame);
        onFrameChange?.(frame);
        onProgress?.(prog);
      },
      scrollTrigger: {
        trigger,
        start,
        end: end ?? `+=${frameCount * 8}`,
        scrub,
        pin: true
      }
    });

    ScrollTrigger.refresh();

    return () => {
      timeline.kill();
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, triggerRef, ready, frameCount, scrub, start, end, onFrameChange]);

  const renderFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imagesRef.current[frameIndex];

    if (!canvas || !ctx || !image) {
      return;
    }

    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    const imageWidth = image.naturalWidth || width;
    const imageHeight = image.naturalHeight || height;

    const scale = Math.max(width / imageWidth, height / imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    // Safety check: ensure image is loaded and valid
    if (!image.complete || image.naturalWidth === 0) {
      return;
    }

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  };

  return {
    ready,
    progress
  };
}
