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
import { getAssetPath } from "@/lib/utils";
import type { Agency } from "@/lib/types";
import { gsap, useGSAP } from "@/lib/gsap";
// import { initSmoothScroll } from "@/lib/lenis"; // Temporarily disabled
import { MapPin, Clock, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ErrorBoundary } from "./ErrorBoundary";
import { AgencyContactFooter } from "@/components/AgencyContactFooter";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

type RouteData = {
  id: string;
  title: string;
  subtitle: string;
  asset_folder: string;
  total_frames: number;
  desktop_total_frames?: number;
  hero_image?: string;
  distance_km?: number;
  duration_hours?: number;
};

type RouteConfig = {
  totalFrames?: number;
  desktopTotalFrames?: number;
  pointsOfInterest: POI[];
};

type RouteClientProps = {
  slug: string;
  tid?: string;
};

export function RouteClient({ slug, tid: initialTid }: RouteClientProps) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [agency, setAgency] = useState<Agency | undefined>(undefined);
  const [agencyList, setAgencyList] = useState<Agency[]>([]);
  const [activeAgencyId, setActiveAgencyId] = useState<string | undefined>(initialTid);
  const [loading, setLoading] = useState(true);
  const [routeConfig, setRouteConfig] = useState<RouteConfig | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  // Read tid from URL client-side (for static export compatibility)
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialTid) {
      const params = new URLSearchParams(window.location.search);
      const tidFromUrl = params.get('tid');
      if (tidFromUrl) {
        setActiveAgencyId(tidFromUrl);
      }
    }
  }, [initialTid]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRoute = async () => {
      const firestore = getFirestoreDb();
      if (!firestore) {
        console.error("Firebase not configured");
        setLoading(false);
        return;
      }

      try {
        const routeRef = doc(firestore, "routes", slug);
        const snapshot = await getDoc(routeRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<RouteData, "id">;
          setRoute({
            id: snapshot.id,
            ...data
          });
        } else {
          console.error(`Route not found: ${slug}`);
        }
      } catch (error) {
        console.error("Error loading route:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoute().catch(() => {
      setLoading(false);
    });
  }, [slug]);

  // Load route configuration dynamically based on device
  useEffect(() => {
    const loadConfig = async () => {
      const devicePath = isMobile ? "mobile" : "desktop";
      try {
        const response = await fetch(getAssetPath(`/routes/${slug.toLowerCase()}/${devicePath}/meta/config.json`));
        if (response.ok) {
          const config = await response.json();
          setRouteConfig(config);
        } else {
          // Fallback to legacy path if new path doesn't exist yet
          const fallbackResponse = await fetch(getAssetPath(`/routes/${slug.toLowerCase()}/meta/config.json`));
          if (fallbackResponse.ok) {
            const config = await fallbackResponse.json();
            setRouteConfig(config);
          }
        }
      } catch (error) {
        console.warn("Could not load route config", error);
      }
    };

    loadConfig();
  }, [slug, isMobile]);

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

      console.log(`[DEBUG] Loading agencies for route: ${route.id}`);

      // Fetch ALL purchases for this route to debug status
      const purchaseSnapshot = await getDocs(
        query(
          collection(firestore, "routePurchases"),
          where("route_id", "==", route.id)
        )
      );

      // Filter for approved only
      const approvedDocs = purchaseSnapshot.docs.filter(d => d.data().status === 'approved');

      if (approvedDocs.length === 0) {
        // Fallback: If we have a direct TID, try to load that agency anyway for debugging/testing
        if (!activeAgencyId) {
          setAgency(undefined);
          setAgencyList([]);
          return;
        }
      }

      const agencyIds = Array.from(
        new Set(
          approvedDocs.map(
            (docItem) => docItem.data().agency_uid as string
          )
        )
      );

      // If activeAgencyId is not in the approved list, add it to checking list to see why it failed
      if (activeAgencyId && !agencyIds.includes(activeAgencyId)) {
        agencyIds.push(activeAgencyId);
      }

      const agencies = await Promise.all(
        agencyIds.map(async (agencyId) => {
          const agencyRef = doc(firestore, "agencies", agencyId);
          const agencySnapshot = await getDoc(agencyRef);

          if (!agencySnapshot.exists()) return null;

          const agencyData = agencySnapshot.data();

          if (!agencyData.is_verified) {
            // return null; // UNCOMMENT TO ENFORCE VERIFICATION
          }

          const trialExpiry = agencyData.trial_expiry?.toDate?.();
          if (trialExpiry && trialExpiry.getTime() < Date.now()) {
            // return null; // UNCOMMENT TO ENFORCE EXPIRY
          }

          return {
            id: agencyId,
            name: agencyData.name,
            contactNo: agencyData.contact_no,
            email: agencyData.email,
            website: agencyData.website,
            address: agencyData.address,
            isVerified: agencyData.is_verified,
            whatsapp: agencyData.whatsapp,
            logoUrl: agencyData.logo_url, // Map snake_case to camelCase
            status: agencyData.status,
            trialStart: agencyData.trial_start?.toDate?.(),
            trialExpiry: agencyData.trial_expiry?.toDate?.()
          } as Agency;
        })
      );

      const filtered = agencies.filter(Boolean) as Agency[];
      setAgencyList(filtered);

      // If we have an active agency from URL, select it
      if (activeAgencyId) {
        const preferred = filtered.find((item) => item.id === activeAgencyId);
        if (preferred) {
          setAgency(preferred);
        }
      }
    };

    loadAgencies().catch((err) => {
      console.error("Error loading agencies:", err);
      setAgency(undefined);
      setAgencyList([]);
    });
  }, [route, activeAgencyId]);

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
            {/* Hero Image */}
            {/* Hero Image */}
            <Image
              src={getAssetPath(route.hero_image || `/routes/${slug}/meta/hero.webp`)}
              alt={route.title}
              fill
              className="object-cover opacity-90"
              priority
              onError={(e) => {
                console.error('Failed to load hero image:', route.hero_image || `/routes/${slug}/meta/hero.webp`);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />

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

        {/* Home Button / Agency Logo */}
        <div className="absolute top-8 left-8 z-30">
          <Link href="/" className="group flex items-center justify-center text-white/80 hover:text-white transition-all duration-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/40 group-hover:shadow-lg group-hover:shadow-accent/20 group-hover:scale-105 overflow-hidden">
              {activeAgencyId && agency?.logoUrl ? (
                <Image
                  src={agency.logoUrl}
                  alt={agency.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : activeAgencyId && agency ? (
                <div className="flex h-full w-full items-center justify-center bg-primary/20 text-primary font-bold text-lg">
                  {agency.name[0]}
                </div>
              ) : (
                <Home className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
              )}
            </div>
          </Link>
        </div>

        <div className="journey-header-content absolute inset-0 z-20 flex flex-col items-center justify-center px-6">
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
          {/* Hero title with letter-by-letter animation */}
          <h1 className="route-hero-title font-display text-4xl sm:text-5xl md:text-6xl font-light text-white mb-6 drop-shadow-2xl tracking-[0.05em] md:tracking-[0.08em] lg:tracking-[0.10em] leading-[1.1] uppercase text-center">
            {route.title}
          </h1>
          {/* Enhanced subtitle */}
          <p className="route-hero-subtitle text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed drop-shadow-lg italic text-center">
            {route.subtitle}
          </p>
        </div>



        {/* Bottom gradient fade to next section */}
        <div className="absolute bottom-0 left-0 w-full h-32 z-20 pointer-events-none bg-gradient-to-t from-black to-transparent" />
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
            mobileFrames={routeConfig?.totalFrames || 1828}
            desktopFrames={routeConfig?.totalFrames || 1920}
            pointsOfInterest={routeConfig?.pointsOfInterest}
            isMobile={isMobile}
          >
            {activeAgencyId && agency && <AgencyContactFooter agency={agency} />}
          </JourneyPlayer>
        </ErrorBoundary>
      </section>

      {/* Partner / Agency Section - HIDDEN if Agency Selected (now in Player) */}
      {!activeAgencyId && (
        <section className="relative z-10 bg-slate-950 py-24 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
            {/* Default view: Show "Book This Route" if no agency is selected via URL */}
            <>
              {/* Section Header */}
              <div className="text-center mb-16 space-y-4">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.3em]">
                  Connect for Planning
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-light text-white tracking-wide">
                  Choose Your Travel Agency
                </h2>
                <p className="text-white/60 max-w-lg mx-auto font-light">
                  Select an agency to view their contact details. Reach out directly via WhatsApp, phone, or email to plan your journey.
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
            </>
          </div>
        </section>
      )}

      {/* Floating WhatsApp Button - Only show when agency is active */}
      {agency?.whatsapp && (
        <FloatingWhatsApp
          phoneNumber={agency.whatsapp}
          agencyName={agency.name}
        />
      )}

    </main>
  );
}
