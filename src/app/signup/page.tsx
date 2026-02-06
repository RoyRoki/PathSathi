'use client';

import { AgencyAuth } from "@/components/AgencyAuth";
import Image from "next/image";
import Link from "next/link";
import { Mountain, ArrowLeft, Sparkles, Award, MapPin } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getAssetPath } from "@/lib/utils";
import { useRef } from "react";

export default function SignupPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.from(".auth-content", {
      x: 100,
      opacity: 0,
      duration: 1.2,
    })
      .from(".benefit-card", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
      }, "-=0.6");
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="relative min-h-screen flex overflow-hidden bg-background">
      {/* Left side: Premium Image & Content */}
      <section className="hidden lg:flex relative w-1/2 overflow-hidden h-screen sticky top-0">
        <Image
          src={getAssetPath("/images/premium-tea.png")}
          alt="Darjeeling Tea Garden"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-black/40 to-transparent flex flex-col justify-end p-16">
          <div className="mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Begin Your Premium <br /> Journey With Us
            </h2>
            <div className="space-y-6">
              {[
                { icon: Award, text: "Sponsor premium 3D journeys and own elite leads" },
                { icon: MapPin, text: "Showcase direct booking links on iconic trails" },
                { icon: Sparkles, text: "7 days free beta access with featured placements" }
              ].map((benefit, i) => (
                <div key={i} className="benefit-card flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-white/90 font-medium">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Right side: Auth Form */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-20 lg:px-24">
        <div className="w-full max-w-md auth-content">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-widest">Back to Home</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Partner Program</h1>
            <p className="text-muted-foreground text-lg font-light">
              Elevate your agency's presence with our unique scrollytelling platform.
            </p>
          </div>

          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-3xl p-8 rounded-[2rem] border border-border/50 shadow-2xl relative">
            <AgencyAuth mode="signup" />
          </div>

          <p className="mt-10 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline transition-all">
              Agency Login →
            </Link>
          </p>

          <div className="mt-16 flex items-center justify-center gap-3 text-xs text-muted-foreground font-semibold uppercase tracking-[0.2em]">
            <Award className="w-4 h-4 text-accent" />
            Award-Winning Partner Platform
          </div>
        </div>
      </section>
    </main>
  );
}
