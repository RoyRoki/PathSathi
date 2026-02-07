"use client";

import { Agency } from "@/lib/types";
import { Phone, Globe, MessageCircle, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { gsap } from "@/lib/gsap";
import { useEffect, useRef, useState } from "react";

function formatWhatsApp(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

type AgencySheetProps = {
  agency?: Agency;
  hasAgencies?: boolean;
  className?: string;
};

export function AgencySheet({ agency, className }: AgencySheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (agency && containerRef.current) {
      gsap.from(containerRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power4.out",
      });
    }
  }, [agency]);

  if (!agency) {
    return (
      <div className={className || "fixed bottom-8 left-1/2 z-40 -translate-x-1/2 w-full max-w-lg px-6 flex justify-center"}>
        <a href="/signup">
          <Button className="rounded-full px-8 py-6 h-auto text-base font-semibold bg-primary hover:bg-primary/90 shadow-xl group">
            Partner With Us
            <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className || "fixed bottom-8 left-1/2 z-40 -translate-x-1/2 w-full max-w-xl px-6"}
    >
      <div className="bg-[rgba(15,23,42,0.85)] backdrop-blur-[20px] border border-white/10 p-8 rounded-[2rem] shadow-2xl shadow-black/20 overflow-hidden relative">
        {/* Mountain Scenery Peek-through hint - kept subtle */}

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo and Info Section */}
          <div className="flex items-start gap-5">
            {/* Agency Logo */}
            <div className="w-20 h-20 rounded-2xl border border-white/10 overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center p-3 shadow-inner">
              {agency.logoUrl && !imgError ? (
                <img
                  src={agency.logoUrl}
                  alt={`${agency.name} logo`}
                  className="w-full h-full object-contain brightness-0 invert opacity-90"
                  onError={() => setImgError(true)}
                />
              ) : (
                <ShieldCheck className="w-8 h-8 text-white/40" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                  Principal Agency
                </span>
                {agency.isVerified && (
                  <div className="relative group/badge">
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md animate-pulse" />
                    <Badge variant="outline" className="relative h-6 px-3 border-transparent bg-gradient-to-r from-blue-500/10 to-cyan-400/10 text-cyan-300 font-medium tracking-wide shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/40 to-cyan-400/40 opacity-50 blur-[1px]" />
                      <span className="relative z-10 flex items-center gap-1.5 text-[10px] uppercase font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Partner
                      </span>
                    </Badge>
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-display font-medium text-white tracking-tight">{agency.name}</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed max-w-xs">
                {agency.address}
              </p>
            </div>
          </div>
        </div>

        {/* Tactile Actions */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-4">
          <a href={`tel:${agency.contactNo}`} className="flex-1 min-w-[120px]">
            <Button
              variant="ghost"
              className="w-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/5 hover:border-white/10 rounded-2xl h-14 font-medium transition-all duration-200 active:scale-95 active:shadow-inner"
            >
              <Phone className="w-5 h-5 mr-3 text-white/70 stroke-[1.5px]" />
              Call Agent
            </Button>
          </a>
          <a href={formatWhatsApp(agency.whatsapp ?? agency.contactNo)} className="flex-1 min-w-[120px]">
            <Button
              variant="ghost"
              className="w-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/5 hover:border-white/10 rounded-2xl h-14 font-medium transition-all duration-200 active:scale-95 active:shadow-inner"
            >
              <MessageCircle className="w-5 h-5 mr-3 text-white/70 stroke-[1.5px]" />
              WhatsApp
            </Button>
          </a>
          {agency.website && (
            <a href={agency.website} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button
                variant="ghost"
                className="w-full md:w-14 h-14 p-0 bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-200 active:scale-95 active:shadow-inner"
              >
                <Globe className="w-5 h-5 text-white/70 stroke-[1.5px]" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
