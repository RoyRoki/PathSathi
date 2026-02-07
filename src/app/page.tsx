'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Clock, Users } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { getActiveRoutes, getRouteAgencies } from '@/lib/services/routes'
import type { Route, Agency } from '@/lib/types/domain'
import { ScrollingGallery } from '@/components/ui/ScrollingGallery'
import { gsap, useGSAP } from '@/lib/gsap'
import { getAssetPath } from '@/lib/utils'
import SplitType from 'split-type'
import { RequestSection } from '@/components/home/RequestSection'
import { CustomCursor } from '@/components/ui/CustomCursor'

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const routesRef = useRef<HTMLElement>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [_routeAgencies, setRouteAgencies] = useState<Record<string, Agency[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Only show routes that have asset folders in public/routes/
  // Add new route slugs here when you add their assets
  const VALID_ROUTE_SLUGS = ['siliguri-kurseong-darjeeling'];

  // Fetch active routes from Firebase
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const activeRoutes = await getActiveRoutes()
        // Filter to only routes that have assets
        const validRoutes = activeRoutes.filter(
          route => VALID_ROUTE_SLUGS.includes(route.pathSlug)
        )
        setRoutes(validRoutes)

        // Fetch agencies for each route
        const agenciesMap: Record<string, Agency[]> = {}
        for (const route of validRoutes) {
          try {
            const agencies = await getRouteAgencies(route.id)
            agenciesMap[route.id] = agencies
          } catch (error) {
            console.error(`Error fetching agencies for route ${route.id}:`, error)
            agenciesMap[route.id] = []
          }
        }
        setRouteAgencies(agenciesMap)
      } catch (error) {
        console.error('Error fetching routes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoutes()
  }, [])

  useGSAP(() => {
    // ── Hero animations ──
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    // Initial Reveal
    if (titleRef.current) {
      const split = new SplitType(titleRef.current, {
        types: 'words',
        tagName: 'span'
      })

      // Background gentle zoom
      tl.to('.hero-bg-mountains img', {
        scale: 1.1,
        duration: 20,
        ease: 'none',
      }, 0)

      // Text Reveal
      tl.from(split.words, {
        yPercent: 100,
        opacity: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: 'power4.out',
      }, 0.5)
        .from('.hero-subtitle', {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        }, '-=0.8')
        .from('.hero-cta', {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        }, '-=0.6')
        .from('.hero-scroll-indicator', {
          opacity: 0,
          duration: 1,
        }, '-=0.4')
    }

    // ── Parallax Scroll Effects ──
    // Mountains (Background) - Moves slowest (0.2x visual speed relative to scroll)
    gsap.to('.hero-bg-mountains', {
      yPercent: 20, // Moves slightly down as we scroll down
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    })

    // Tea Gardens (Mid-ground) - Moves medium speed (0.5x)
    gsap.to('.hero-bg-midground', {
      yPercent: 40, // Moves faster than mountains
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    })

    // Text/Foreground (1x - Natural scroll, but we can add a slight opacity fade)
    gsap.to('.hero-foreground', {
      yPercent: 60, // Parallax text movement
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top', // Fade out by 60% of viewport
        scrub: true,
      }
    })

    // ── Magic section — stagger reveal ──
    const magicSteps = gsap.utils.toArray<HTMLElement>('.magic-step')
    magicSteps.forEach((step, i) => {
      gsap.from(step, {
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 20, // Gentle 20px slide as requested
        opacity: 0,
        duration: 0.8,
        delay: i * 0.2,
        ease: 'power3.out',
      })
    })

    // ── Route cards ──
    const cards = gsap.utils.toArray<HTMLElement>('.route-card')
    cards.forEach((card) => {
      const image = card.querySelector('.route-image') as HTMLElement
      const content = card.querySelector('.route-content') as HTMLElement

      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
      })

      card.addEventListener('mouseenter', () => {
        gsap.to(image, { scale: 1.05, duration: 0.6, ease: 'power2.out' })
        gsap.to(content, { y: -8, duration: 0.4, ease: 'power2.out' })
      })
      card.addEventListener('mouseleave', () => {
        gsap.to(image, { scale: 1, duration: 0.6, ease: 'power2.out' })
        gsap.to(content, { y: 0, duration: 0.4, ease: 'power2.out' })
      })
    })

    // ── CTA section ──
    gsap.from('.cta-title', {
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: 20,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out',
    })

    // ── Footer animations ──
    const footerTitle = document.querySelector('.footer-reveal-title') as HTMLElement
    if (footerTitle) {
      const splitFooter = new SplitType(footerTitle, {
        types: 'words',
        tagName: 'span'
      })

      gsap.from(splitFooter.words, {
        scrollTrigger: {
          trigger: footerTitle,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: 'power3.out',
      })
    }

    gsap.from('.footer-reveal-text', {
      scrollTrigger: {
        trigger: '.footer-reveal-text',
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
      y: 20,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2
    })

  }, { scope: heroRef, dependencies: [] })

  return (
    <main className="relative overflow-hidden cursor-none"> {/* Hide default cursor here too for safety */}
      <CustomCursor />

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">

        {/* Layer 1: Background Mountains (Moves slow) */}
        <div className="hero-bg-mountains absolute inset-0 -z-30 h-[120%] w-full top-0">
          <Image
            src={getAssetPath("/images/darjeeling_hero_bg_1770289408859.webp")}
            alt="Himalayan Peaks"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Atmospheric Haze */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/80" />
        </div>

        {/* Layer 2: Midground Tea Gardens (Moves medium) */}
        <div className="hero-bg-midground absolute inset-0 -z-20 h-[120%] w-full top-[20%]">
          <Image
            src={getAssetPath("/images/darjeeling_tea_garden.webp")}
            alt="Tea Gardens"
            fill
            className="object-cover object-top opacity-90"
            priority
          />
          {/* Blend Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Layer 3: Foreground Text */}
        <div className="hero-foreground relative z-10 py-32 px-6 w-full">
          <Container>
            <div className="max-w-5xl mx-auto text-center">
              {/* Title */}
              <h1
                ref={titleRef}
                className="mb-8 font-display text-5xl sm:text-7xl md:text-8xl lg:text-[100px] text-white leading-[1.05] drop-shadow-2xl tracking-tight"
                style={{ perspective: '1000px', textShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
              >
                The Journey Begins<br />Before You Leave.
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle mb-12 max-w-2xl mx-auto text-xl md:text-2xl text-white/90 leading-relaxed font-light text-balance drop-shadow-lg">
                Experience your next adventure through an immersive 3D visual odyssey. Move through the mountains, from your screen.
              </p>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
                <button
                  onClick={() => {
                    document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hero-cta group inline-flex items-center gap-3 px-10 py-5 bg-white text-primary text-sm tracking-[0.2em] uppercase font-bold rounded-full hover:bg-white/90 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-500"
                >
                  Start Exploring
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  href="/signup"
                  className="hero-cta inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-full hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-500"
                >
                  For Agencies
                </Link>
              </div>
            </div>
          </Container>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 mix-blend-difference">
          <span className="text-white/70 text-[10px] tracking-[0.3em] uppercase">Scroll to Fly</span>
          <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-indicator" />
          </div>
        </div>
      </section>

      {/* ═══════════ MAGIC SECTION — How it Works ═══════════ */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white relative overflow-hidden">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4 block">How it Works</span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-primary mb-6 leading-tight">
              Don’t just book a trip.<br />Live the route.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Experience the journey before you commit. Our unique scroll-driven technology lets you explore every curve of the road in cinematic 3D.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop - Subtle and behind content */}
            <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-px bg-border/40 -z-10" />

            {[
              {
                step: '01',
                title: 'Choose Your Path',
                desc: 'Browse a curated list of iconic journeys, from the tea gardens of North Bengal to the peaks of Sikkim.'
              },
              {
                step: '02',
                title: 'Scroll to Travel',
                desc: 'Our "Immersive Journey" technology uses 1,920+ cinematic frames. As you scroll, you move along the road in 360-degree detail.'
              },
              {
                step: '03',
                title: 'Connect Directly',
                desc: 'Love the route? Connect with verified agencies that specialize in it. No middlemen, just a direct line to your guide.'
              }
            ].map((item) => (
              <div key={item.step} className="magic-step flex flex-col items-center text-center group h-full">
                {/* Step Number Circle with Card feel */}
                <div className="w-24 h-24 bg-white border border-border rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-500">
                  <span className="font-display text-3xl text-primary group-hover:text-accent transition-colors duration-300">{item.step}</span>
                </div>

                {/* Content Card */}
                <div className="flex-1 w-full p-8 rounded-3xl bg-secondary/5 border border-transparent group-hover:border-border/60 transition-colors duration-300">
                  <h3 className="text-xl font-display text-primary mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm text-balance">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════ GALLERY — No header, larger images ═══════════ */}
      <ScrollingGallery />

      {/* ═══════════ ROUTES — Asymmetric Magazine Grid ═══════════ */}
      <section ref={routesRef} id="routes" className="py-24 md:py-32 bg-secondary/5">
        <Container>
          <div className="mb-16">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4 font-medium">The Marketplace</p>
            <h2 className="text-4xl sm:text-5xl mb-4 font-display text-primary">
              Popular Journeys on PathSathi
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              Scroll through routes, discover hidden gems, and connect directly with the experts who lead the way.
            </p>
          </div>

          {/* Asymmetric grid -> Horizontal scroll on mobile */}
          <div className="flex md:grid md:grid-cols-2 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:pb-0 scrollbar-visible md:scrollbar-default">
            {isLoading ? (
              // Loading skeleton
              <>
                <div className="md:col-span-2 h-[500px] rounded-2xl bg-card animate-pulse" />
                <div className="h-[400px] rounded-2xl bg-card animate-pulse" />
                <div className="h-[400px] rounded-2xl bg-card animate-pulse" />
              </>
            ) : routes.length === 0 ? (
              <div className="md:col-span-2 text-center py-16 text-muted-foreground">
                <p className="text-lg">No routes available yet. Check back soon!</p>
              </div>
            ) : (
              routes.map((route, i) => {
                const isLarge = i === 0
                return (
                  <Link
                    key={route.id}
                    href={`/routes/${route.pathSlug}`}
                    className={`route-card group block min-w-[85vw] sm:min-w-[400px] md:min-w-0 flex-shrink-0 snap-center ${isLarge ? 'md:col-span-2' : ''}`}
                  >
                    <div className={`relative overflow-hidden rounded-2xl bg-card ${isLarge ? 'h-[550px]' : 'h-[450px]'} shadow-lg hover:shadow-2xl transition-all duration-500`}>
                      {/* Image */}
                      <Image
                        src={getAssetPath(route.heroImage || "/images/mountain_road_journey_1770289426463.png")}
                        alt={route.title}
                        fill
                        className="route-image object-cover transition-transform duration-700 will-change-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />

                      {/* Content overlay at bottom */}
                      <div className="route-content absolute inset-x-0 bottom-0 p-8 sm:p-10 transition-transform duration-500">
                        <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-3 leading-tight drop-shadow-md">
                          {route.title}
                        </h3>
                        <p className="text-white/80 mb-6 max-w-lg text-lg font-light">
                          {route.subtitle}
                        </p>

                        <div className="flex flex-col gap-5">
                          {/* Stats Row */}
                          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/90 font-medium">
                            {route.distanceKm && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent" />
                                <span>{route.distanceKm} KM</span>
                              </div>
                            )}
                            {route.durationHours && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                <span>{route.durationHours} Hours</span>
                              </div>
                            )}
                            {/* Static Viewpoints Badge for "feel" as per request */}
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              <span>20+ Viewpoints</span>
                            </div>

                            {(route.sponsorCount ?? 0) > 0 && (
                              <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                                <Users className="w-3.5 h-3.5 text-accent" />
                                <span className="text-white font-semibold">{route.sponsorCount} Verified {route.sponsorCount === 1 ? 'Agency' : 'Agencies'}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Row */}
                          <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-2">
                            <div className="flex items-center gap-3 text-white group-hover:gap-4 transition-all">
                              <span className="tracking-[0.15em] uppercase text-sm font-bold">Start Virtual Journey</span>
                              <ArrowRight className="w-5 h-5 text-accent" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </Container>
      </section>

      {/* ═══════════ PARTNER PORTAL SECTION — Light Theme ═══════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden tea-leaf-bg">
        <Container>
          {/* Section Headline */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-primary mb-6 leading-tight">
              Empower Your Agency with Immersive Storytelling.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Join the only platform designed to showcase the beauty of North Bengal and Sikkim through interactive, 3D-driven itineraries.
            </p>
          </div>

          {/* Triple-Value Grid — Horizontal 3 Columns */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                number: "01",
                title: "Immersive Sales",
                desc: "Let travelers 'drive' the route before they book. Higher engagement leads to faster conversions."
              },
              {
                number: "02",
                title: "Direct Connections",
                desc: "Your WhatsApp, Phone, and Email are front-and-center. No middlemen, no hidden fees."
              },
              {
                number: "03",
                title: "Zero Commission",
                desc: "PathSathi is a bridge, not a booking engine. You keep 100% of your profits from every lead."
              }
            ].map((feature) => (
              <div key={feature.number} className="clay-card p-8 group hover:scale-[1.02] transition-transform duration-500">
                {/* Orange accent number */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
                  <span className="text-accent font-display text-4xl font-bold">{feature.number}.</span>
                  <h3 className="text-xl font-display text-primary">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Floating Action Bar - Minimalist */}
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-6 max-w-4xl mx-auto shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">Ready to elevate your agency?</p>
                <p className="text-lg font-display text-primary">Start showcasing routes in immersive 3D</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-white text-sm tracking-[0.15em] uppercase font-bold rounded-full hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 transition-all duration-500 whitespace-nowrap"
                >
                  Activate <span className="hidden sm:inline">Your</span> Free Beta Plan
                  <ArrowRight className="w-4 h-4" />
                </Link>

              </div>
            </div>
          </div>
        </Container>
      </section>
      {/* ═══════════ CUSTOM PATH SECTION ═══════════ */}
      <RequestSection />

      {/* ═══════════ TRUST & SOCIAL PROOF — Ghost Footer ═══════════ */}
      <section className="relative py-24 text-center overflow-hidden ghost-footer border-t border-border/20">
        <Container>
          <h3 className="footer-reveal-title font-display text-3xl mb-4">
            Crafted in Siliguri. Built for the Mountains.
          </h3>
          <p className="footer-reveal-text text-muted-foreground text-lg font-light max-w-xl mx-auto italic">
            "For every road that leads to the mountains, there is a story. We help you tell it."
          </p>
        </Container>
      </section>
    </main>
  )
}
