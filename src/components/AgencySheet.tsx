"use client";

import { Agency } from "@/lib/types";
import { Phone, Mail, Globe, MessageCircle, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { gsap } from "@/lib/gsap";
import { useEffect, useRef } from "react";

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

export function AgencySheet({ agency, hasAgencies, className }: AgencySheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className={className || "fixed bottom-8 left-1/2 z-40 -translate-x-1/2 w-full max-w-lg px-6"}>
        <div className="bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] shadow-3xl text-center">
          <p className="text-muted-foreground font-light leading-relaxed mb-6">
            {hasAgencies
              ? "Select a curated travel agency to unveil their exclusive itineraries and premium services."
              : "This pristine route eagerly awaits its first premium partner. Agencies can claim this heritage trail to showcase their expertise."}
          </p>
          <a href="/signup">
            <Button className="rounded-full px-8 py-6 h-auto text-base font-semibold bg-primary hover:bg-primary/90 shadow-xl group">
              Partner With Us
              <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className || "fixed bottom-8 left-1/2 z-40 -translate-x-1/2 w-full max-w-xl px-6"}
    >
      <div className="bg-white/90 dark:bg-black/80 backdrop-blur-3xl border border-white/30 dark:border-white/10 p-8 rounded-[2.5rem] shadow-3xl overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo and Info Section */}
          <div className="flex items-start gap-4">
            {/* Agency Logo */}
            {agency.logoUrl ? (
              <div className="w-16 h-16 rounded-2xl border border-border/50 overflow-hidden bg-background/20 flex-shrink-0">
                <img
                  src={agency.logoUrl}
                  alt={`${agency.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Principal Agency
                </span>
                {agency.isVerified && (
                  <Badge variant="outline" className="h-5 px-2 border-primary/30 text-primary bg-primary/5">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h3 className="text-3xl font-bold mb-2 tracking-tight">{agency.name}</h3>
              <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xs italic">
                {agency.address}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-foreground/80 font-medium whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              {agency.contactNo}
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground/80 font-medium whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              {agency.email}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 flex flex-wrap gap-4">
          <a href={`tel:${agency.contactNo}`} className="flex-1 min-w-[140px]">
            <Button variant="outline" className="w-full rounded-2xl h-14 font-semibold border-primary/20 hover:bg-primary/5">
              Call Direct
            </Button>
          </a>
          <a href={formatWhatsApp(agency.whatsapp ?? agency.contactNo)} className="flex-1 min-w-[140px]">
            <Button className="w-full rounded-2xl h-14 font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white border-none shadow-lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
          </a>
          {agency.website && (
            <a href={agency.website} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button variant="ghost" className="w-full md:w-14 h-14 p-0 rounded-2xl border border-border/50">
                <Globe className="w-5 h-5" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
