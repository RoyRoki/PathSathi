"use client";

import type { Agency } from "@/lib/types";
import { Users } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useEffect, useRef } from "react";

type AgencySelectorProps = {
  agencies: Agency[];
  activeId?: string;
  onSelect: (id: string) => void;
  className?: string;
};

export function AgencySelector({ agencies, activeId, onSelect, className }: AgencySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 1,
      });
    }
  }, []);

  if (agencies.length <= 1) return null;

  return (
    <div
      ref={containerRef}
      className={className || "fixed bottom-36 left-1/2 z-[45] -translate-x-1/2 flex items-center gap-4 py-3 px-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-3xl text-sm"}
    >
      <div className="flex items-center gap-2 pr-4 border-r border-white/10">
        <Users className="w-4 h-4 text-accent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          Available Agencies
        </span>
      </div>
      <div className="flex flex-wrap gap-2 max-w-[400px]">
        {agencies.map((agency) => (
          <button
            key={agency.id}
            type="button"
            onClick={() => onSelect(agency.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${agency.id === activeId
              ? "bg-accent text-foreground shadow-lg scale-105"
              : "bg-white/5 text-white/80 hover:bg-white/20 hover:text-white border border-white/10"
              }`}
          >
            {agency.name}
          </button>
        ))}
      </div>
    </div>
  );
}
