'use client';

import { useEffect, useState, useRef } from "react";
import type { POI } from "./POIMarker";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { JourneyPlayer } from "@/components/JourneyPlayer";
import { AgencySelector } from "@/components/AgencySelector";
import { AgencySheet } from "@/components/AgencySheet";
import { routes as mockRoutes } from "@/lib/mock-data";
import type { Agency } from "@/lib/types";
import { gsap, useGSAP } from "@/lib/gsap";
// import { initSmoothScroll } from "@/lib/lenis"; // Temporarily disabled
import { MapPin, Clock, Home, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FloatingStats } from "./FloatingStats";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ErrorBoundary } from "./ErrorBoundary";

type RouteData = {
  id: string;
  title: string;
  subtitle: string;
  asset_folder: string;
  total_frames: number;
  heroImage?: string;
  distanceKm?: number;
  durationHours?: number;
};

type RouteConfig = {
  pointsOfInterest: POI[];
};

type RouteClientProps = {
  slug: string;
  tid?: string;
};

export function RouteClient({ slug, tid }: RouteClientProps) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [agency, setAgency] = useState<Agency | undefined>(undefined);
  const [agencyList, setAgencyList] = useState<Agency[]>([]);
  const [activeAgencyId, setActiveAgencyId] = useState<string | undefined>(tid);
  const [loading, setLoading] = useState(true);
  const [routeConfig, setRouteConfig] = useState<RouteConfig | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Initialize Lenis smooth scrolling - TEMPORARILY DISABLED
  // useEffect(() => {
  //   const lenis = initSmoothScroll();
  //
  //   return () => {
  //     lenis.destroy();
  //   };
  // }, []);

  useEffect(() => {
    const loadRoute = async () => {
      const firestore = getFirestoreDb();
      if (!firestore) {
        const fallback = mockRoutes.find((item) => item.slug === slug);
        if (fallback) {
          setRoute({
            id: fallback.id,
            title: fallback.title,
            subtitle: fallback.subtitle,
            asset_folder: fallback.assetFolder || "dummy",
            total_frames: fallback.totalFrames || 0,
            heroImage: fallback.heroImage
          });
        }
        setLoading(false);
        return;
      }
      const routeRef = doc(firestore, "routes", slug);
      const snapshot = await getDoc(routeRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as Omit<RouteData, "id">;
        const fallback = mockRoutes.find((item) => item.slug === slug);
        setRoute({
          id: snapshot.id,
          ...data,
          heroImage: data.heroImage || fallback?.heroImage
        });
        setLoading(false);
      } else {
        const fallback = mockRoutes.find((item) => item.slug === slug);
        if (fallback) {
          setRoute({
            id: fallback.id,
            title: fallback.title,
            subtitle: fallback.subtitle,
            asset_folder: fallback.assetFolder || "dummy",
            total_frames: fallback.totalFrames || 0,
            heroImage: fallback.heroImage
          });
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    };

    loadRoute().catch(() => {
      setLoading(false);
    });

    // Load route configuration
    const loadConfig = async () => {
      try {
        const response = await fetch(`/routes/${slug}/meta/config.json`);
        if (response.ok) {
          const config = await response.json();
          setRouteConfig(config);
        }
      } catch (error) {
        console.warn("Could not load route config", error);
      }
    };

    loadConfig();
  }, [slug]);

  useGSAP(() => {
    if (!route) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Letter-by-letter hero title animation
    const titleElement = document.querySelector('.route-hero-title');
    if (titleElement && titleElement.textContent) {
      const text = titleElement.textContent;
      titleElement.innerHTML = text
        .split('')
        .map(char => `<span class="inline-block opacity-0" style="transform: translateY(100px)">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      gsap.to('.route-hero-title span', {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.04,
        ease: 'power4.out',
        delay: 0.5
      });
    }

    // Stagger header content (excluding title which is already animated)
    tl.from(".journey-header-badge, .route-hero-subtitle", {
      y: 50,
      opacity: 0,
      stagger: 0.15,
      duration: 1.2,
    })
      .from(".journey-player-container", {
        opacity: 0,
        y: 100,
        duration: 1.2,
      }, "-=0.6");

    // Enhanced parallax for hero background (desktop only)
    const shouldEnableParallax = window.matchMedia('(min-width: 1024px)').matches;
    if (shouldEnableParallax) {
      gsap.to(".journey-header-bg", {
        yPercent: 40,
        ease: "none",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        }
      });
    }

    // Floating stats stagger animation
    gsap.from('.floating-stat-card', {
      opacity: 0,
      y: 60,
      scale: 0.95,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.floating-stats-container',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }, [route]);

  // Load agencies effect (existing logic)
  useEffect(() => {
    const loadAgencies = async () => {
      const firestore = getFirestoreDb();
      if (!route || !firestore) {
        setAgency(undefined);
        setAgencyList([]);
        return;
      }

      const purchaseSnapshot = await getDocs(
        query(
          collection(firestore, "routePurchases"),
          where("route_id", "==", route.id),
          where("status", "==", "approved")
        )
      );

      if (purchaseSnapshot.empty) {
        setAgency(undefined);
        setAgencyList([]);
        return;
      }

      const agencyIds = Array.from(
        new Set(
          purchaseSnapshot.docs.map(
            (docItem) => docItem.data().agency_uid as string
          )
        )
      );

      const agencies = await Promise.all(
        agencyIds.map(async (agencyId) => {
          const agencyRef = doc(firestore, "agencies", agencyId);
          const agencySnapshot = await getDoc(agencyRef);
          if (!agencySnapshot.exists()) return null;
          const agencyData = agencySnapshot.data() as any;
          if (!agencyData.is_verified) return null;
          const trialExpiry = agencyData.trial_expiry?.toDate?.();
          if (trialExpiry && trialExpiry.getTime() < Date.now()) return null;
          return {
            id: agencyId,
            name: agencyData.name,
            phone: agencyData.contact_no,
            email: agencyData.email,
            website: agencyData.website,
            address: agencyData.address,
            isVerified: agencyData.is_verified,
            whatsapp: agencyData.whatsapp,
            status: agencyData.status,
            trialStart: agencyData.trial_start?.toDate?.()?.toISOString(),
            trialExpiry: agencyData.trial_expiry?.toDate?.()?.toISOString()
          } as Agency;
        })
      );

      const filtered = agencies.filter(Boolean) as Agency[];
      setAgencyList(filtered);

      const preferredId = tid && filtered.find((item) => item.id === tid)?.id;
      setActiveAgencyId(preferredId);
      setAgency(filtered.find((item) => item.id === preferredId));
    };

    loadAgencies().catch(() => {
      setAgency(undefined);
      setAgencyList([]);
    });
  }, [route, tid]);

  useEffect(() => {
    if (!activeAgencyId) {
      setAgency(undefined);
      return;
    }
    setAgency(agencyList.find((item) => item.id === activeAgencyId));
  }, [agencyList, activeAgencyId]);

  const handleAgencySelect = (id: string) => {
    setActiveAgencyId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tid", id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  if (!route && loading) {
    return (
      <LoadingScreen />
    );
  }

  if (!route) {
    return (
      <div className="flex min-h-screen items-center justify-center text-foreground">
        Route not found.
      </div>
    );
  }

  return (
    <main ref={containerRef} className="relative min-h-screen bg-background">
      {/* Cinematic Header */}
      <section ref={headerRef} className="relative h-[80vh] lg:h-[100vh] w-full bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="journey-header-bg absolute inset-0">
            {/* ALWAYS VISIBLE: Image background with overlay */}
            {route.heroImage && (
              <Image
                src={route.heroImage}
                alt={route.title}
                fill
                className="object-cover opacity-90"
                priority
                onError={(e) => {
                  // Hide image if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}

            {/* Light Gradient for text readability - MUCH LIGHTER */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />

            {/* Animated gradient overlay - lighter */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 mix-blend-overlay" />

            {/* Top gradient for readability - REMOVED */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent" />

            {/* Film Grain Texture */}
            <div
              className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='a'%3E%3CfeTurbulence baseFrequency='.75' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath d='M0 0h300v300H0z' filter='url(%23a)' opacity='.05'/%3E%3C/svg%3E")`
              }}
            />
          </div>
        </div>

        {/* Home Button */}
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="group flex items-center justify-center text-white/80 hover:text-white transition-all duration-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/40 group-hover:shadow-lg group-hover:shadow-accent/20 group-hover:scale-105">
              <Home className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
            </div>
          </Link>
        </div>

        <div className="journey-header-content absolute bottom-24 left-12 z-20 max-w-3xl px-6">
          {/* Enhanced badges */}
          <div className="journey-header-badge flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 text-accent">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Signature Route</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-white/60">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Immersive Experience</span>
            </div>
          </div>
          {/* Massive hero title with letter-by-letter animation */}
          <h1 className="route-hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white mb-6 drop-shadow-2xl tracking-[0.05em] md:tracking-[0.08em] lg:tracking-[0.10em] leading-[1.1] uppercase">
            {route.title}
          </h1>
          {/* Enhanced subtitle */}
          <p className="route-hero-subtitle text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed drop-shadow-lg italic">
            {route.subtitle}
          </p>
        </div>



        {/* SVG Curve Clip Path Definition */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id="hero-curve-clip" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L0,0.95 Q0.25,0.98 0.5,0.95 T1,0.95 L1,0 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Golden Accent Curve Line */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <svg
            className="w-full h-16 md:h-24 lg:h-32"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96"
              fill="none"
              stroke="url(#gradient-line)"
              strokeWidth="3"
              className="opacity-50"
            />
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Scrollytelling Section */}
      <section className="journey-player-container relative">
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8">
            <div className="max-w-2xl text-center">
              <h2 className="text-2xl font-bold mb-4">Journey Player Unavailable</h2>
              <p className="text-slate-300">The immersive scrollytelling experience couldn't load. Please refresh the page.</p>
            </div>
          </div>
        }>
          <JourneyPlayer
            assetFolder={route.asset_folder}
            totalFrames={route.total_frames}
            pointsOfInterest={routeConfig?.pointsOfInterest}
          />
        </ErrorBoundary>
      </section>

      {/* Partner / Agency Section */}
      <section className="relative z-10 bg-slate-950 py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="text-accent text-xs font-bold uppercase tracking-[0.3em]">
              Heritage Trail Partners
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-wide">
              Curated Excellence
            </h2>
            <p className="text-white/60 max-w-lg mx-auto font-light">
              Experience this journey with our verified premium partners who ensure every moment is memorable.
            </p>
          </div>

          <AgencySelector
            agencies={agencyList}
            activeId={activeAgencyId}
            onSelect={handleAgencySelect}
            className="relative bottom-auto left-auto translate-x-0 flex flex-wrap justify-center gap-4 py-3 px-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md mb-12"
          />

          <AgencySheet
            agency={agency}
            hasAgencies={agencyList.length > 0}
            className="relative bottom-auto left-auto translate-x-0 w-full max-w-3xl mx-auto"
          />
        </div>
      </section>

    </main>
  );
}
