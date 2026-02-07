'use client';

import { AgencyAuth } from "@/components/AgencyAuth";
import Image from "next/image";
import Link from "next/link";
import { Mountain, ArrowLeft, ShieldCheck, Sparkles, Phone, MapPin } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getAssetPath } from "@/lib/utils";
import { useRef } from "react";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.from(".auth-content", {
      x: 100,
      opacity: 0,
      duration: 1.2,
    })
      .from(".auth-image-overlay > *", {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
      }, "-=0.8");
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="relative min-h-screen flex overflow-hidden bg-background">
      {/* Left side: Premium Image */}
      <section className="hidden lg:flex relative w-1/2 overflow-hidden h-screen sticky top-0">
        <Image
          src={getAssetPath("/images/luxury-monastery.png")}
          alt="Himalayan Monastery"
          fill
          className="object-cover"
          priority
        />
        <div className="auth-image-overlay absolute inset-0 bg-gradient-to-t from-primary/90 via-black/20 to-transparent flex flex-col justify-end p-16">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6">
              <Mountain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              Empowering Himalayan <br /> Travel Partners
            </h2>
            <p className="text-xl text-white/80 font-light max-w-md">
              Join the elite circle of certified partners showcasing the soul of the mountains.
            </p>
          </div>

          <div className="space-y-6 mt-12 border-t border-white/20 pt-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">7-Day Free Beta Access</h3>
                <p className="text-sm text-white/60 leading-relaxed">Early access to premium route sponsorship features with zero commitment.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Direct Traveler Connections</h3>
                <p className="text-sm text-white/60 leading-relaxed">Your agency contact details displayed directly on popular routes.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Exclusive Route Ownership</h3>
                <p className="text-sm text-white/60 leading-relaxed">Connect your brand with iconic Himalayan journeys.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right side: Auth Form */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-20 lg:px-24">
        <div className="w-full max-w-md auth-content">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-widest">Back to Explore</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Partner Access</h1>
            <p className="text-muted-foreground text-lg font-light">
              Enter your business email to manage your journeys and leads.
            </p>
          </div>

          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-3xl p-8 rounded-[2rem] border border-border/50 shadow-2xl relative">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
            <AgencyAuth />
          </div>

          <div className="mt-16 flex items-center justify-center gap-3 text-xs text-muted-foreground font-semibold uppercase tracking-[0.2em]">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Verified & Secure Environment
          </div>
        </div>
      </section>
    </main>
  );
}
