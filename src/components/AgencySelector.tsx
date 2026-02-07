"use client";

import type { Agency } from "@/lib/types";
import { Users, CheckCircle2 } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useEffect, useRef, useState } from "react";

type AgencySelectorProps = {
  agencies: Agency[];
  activeId?: string;
  onSelect: (id: string) => void;
  className?: string;
};

export function AgencySelector({ agencies, activeId, onSelect, className }: AgencySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    // Ensure visibility with a simple fade-in
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all"
      });
    }
  }, []);

  if (agencies.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`${className || "w-full text-center"}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {agencies.map((agency) => {
          const isActive = agency.id === activeId;

          return (
            <button
              key={agency.id}
              type="button"
              onClick={() => onSelect(agency.id)}
              className={`
                group relative flex flex-col items-center p-8 rounded-[2.5rem] text-left w-full h-full transition-all duration-500
                ${isActive
                  ? "bg-white scale-[1.02] z-30 opacity-100 shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.05),inset_6px_6px_12px_rgba(255,255,255,1),12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,1)]"
                  : "bg-[#F0F2F5] hover:bg-white hover:scale-[1.01] z-10 opacity-100 shadow-[8px_8px_16px_rgba(0,0,0,0.06),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.08),-12px_-12px_24px_rgba(255,255,255,1)]"
                }
              `}
            >
              {/* Selection Checkmark */}
              {isActive && (
                <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-2 shadow-lg z-40 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}

              {/* Logo Area */}
              <div className={`
                w-28 h-28 mb-8 rounded-2xl flex items-center justify-center p-6 bg-white 
                shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05)] border border-white
                transition-all duration-500 group-hover:scale-105
              `}>
                {agency.logoUrl && !imageErrors[agency.id] ? (
                  <img
                    src={agency.logoUrl}
                    alt={agency.name}
                    className="w-full h-full object-contain opacity-100 mix-blend-multiply"
                    onError={() => handleError(agency.id)}
                  />
                ) : (
                  <Users className="w-10 h-10 text-neutral-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col items-center w-full z-20">
                <h3 className={`
                  text-xl font-display font-bold mb-3 text-center leading-tight tracking-tight
                  ${isActive ? "text-primary" : "text-neutral-800"}
                `}>
                  {agency.name}
                </h3>

                {agency.address && (
                  <p className="text-sm text-neutral-500 text-center line-clamp-2 font-medium px-4">
                    {agency.address}
                  </p>
                )}

                {/* Verified Badge with Metallic Reflection */}
                {agency.isVerified && (
                  <div className="mt-6 pt-0 w-full flex justify-center">
                    <div className="relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-neutral-100 to-white border border-white shadow-sm">
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary relative z-10">
                        Verified Partner
                      </span>
                      {/* Rotating Metallic Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-full h-full -translate-x-full animate-[shimmer_3s_infinite] opacity-50" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
