"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { gsap } from "@/lib/gsap";

interface AudioPlayerProps {
    audioSrc: string;
    autoPlay?: boolean;
}

export function AudioPlayer({ audioSrc, autoPlay = false }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // Don't render if no audio source
    if (!audioSrc) {
        return null;
    }

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.loop = true;
        audio.volume = 0.7;

        const handleCanPlay = () => {
            setIsLoaded(true);
            if (autoPlay) {
                audio.play().catch(() => {
                    // Auto play blocked, user needs to interact
                    console.log("Autoplay blocked - user interaction required");
                });
            }
        };

        audio.addEventListener("canplaythrough", handleCanPlay);

        return () => {
            audio.removeEventListener("canplaythrough", handleCanPlay);
        };
    }, [autoPlay]);

    const toggleAudio = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            // Fade in
            gsap.fromTo(
                audio,
                { volume: 0 },
                {
                    volume: 0.7,
                    duration: 0.5,
                    ease: "power2.out",
                }
            );
            audio.play();
            setIsMuted(false);
        } else {
            // Fade out
            gsap.to(audio, {
                volume: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    audio.pause();
                },
            });
            setIsMuted(true);
        }

        // Button pulse animation
        if (buttonRef.current) {
            gsap.fromTo(
                buttonRef.current,
                { scale: 1 },
                {
                    scale: 1.2,
                    duration: 0.2,
                    ease: "back.out(3)",
                    yoyo: true,
                    repeat: 1,
                }
            );
        }
    };

    // Keyboard shortcut: M for mute
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "m" || e.key === "M") {
                toggleAudio();
            }
        };

        window.addEventListener("keypress", handleKeyPress);
        return () => window.removeEventListener("keypress", handleKeyPress);
    }, [isMuted]);

    return (
        <>
            <audio ref={audioRef} src={audioSrc} preload="auto" />

            <div className="fixed bottom-28 right-8 z-40">
                <button
                    ref={buttonRef}
                    onClick={toggleAudio}
                    disabled={!isLoaded}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-background/90 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />

                    {/* Pulsing ring when playing */}
                    {!isMuted && (
                        <div className="absolute inset-0 rounded-full border-2 border-accent/40 animate-ping" />
                    )}

                    {/* Icon */}
                    <div className="relative z-10">
                        {isMuted ? (
                            <VolumeX className="h-6 w-6 text-white/70 group-hover:text-white transition-colors" />
                        ) : (
                            <Volume2 className="h-6 w-6 text-accent group-hover:text-accent/80 transition-colors" />
                        )}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                        <div className="bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap">
                            <span className="text-xs font-medium text-white">
                                {isMuted ? "Unmute Audio" : "Mute Audio"}
                                <span className="text-white/50 ml-2">(M)</span>
                            </span>
                        </div>
                        <div className="h-2 w-2 bg-background/95 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
                    </div>

                    {/* Loading indicator */}
                    {!isLoaded && (
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
                    )}
                </button>
            </div>
        </>
    );
}
