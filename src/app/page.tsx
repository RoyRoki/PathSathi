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

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const routesRef = useRef<HTMLElement>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeAgencies, setRouteAgencies] = useState<Record<string, Agency[]>>({})
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
    if (titleRef.current) {
      const split = new SplitType(titleRef.current, {
        types: 'words',
        tagName: 'span'
      })

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      // Ken Burns background — slow zoom
      tl.to('.hero-bg-image', {
        scale: 1.15,
        duration: 20,
        ease: 'none',
      }, 0)

      // Word-by-word reveal
      tl.from(split.words, {
        yPercent: 100,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power4.out',
      }, 0.3)
        // .from('.hero-subtitle', {
        //   y: 40,
        //   opacity: 0,
        //   duration: 0.8,
        //   ease: 'power3.out'
        // }, '-=0.4')
        // .from('.hero-cta', {   <-- Temporarily removed to fix visibility
        //   y: 30,
        //   opacity: 0,
        //   duration: 0.7,
        //   ease: 'power3.out',
        // }, '-=0.3')
        .from('.hero-scroll-indicator', {
          opacity: 0,
          duration: 1,
        }, '-=0.2')
    }

    // Parallax on scroll
    gsap.to('.hero-bg-layer', {
      yPercent: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    })

    // ── Features section — stagger reveal ──
    const featureItems = gsap.utils.toArray<HTMLElement>('.feature-item')
    featureItems.forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        duration: 1.0,
        delay: i * 0.1,
        ease: 'power3.out',
      })
    })

    // Feature image parallax
    gsap.from('.feature-image', {
      scrollTrigger: {
        trigger: '.feature-image',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: 80,
      opacity: 0,
      scale: 0.95,
      duration: 1.2,
      ease: 'power3.out',
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
      y: 60,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out',
    })

  }, { scope: heroRef, dependencies: [] })

  return (
    <main ref={heroRef} className="relative overflow-hidden">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Ken Burns + warm overlay */}
        <div className="hero-bg-layer absolute inset-0 -z-10">
          <Image
            src={getAssetPath("/images/darjeeling_hero_bg_1770289408859.png")}
            alt="Darjeeling mountains at dawn"
            fill
            className="hero-bg-image object-cover origin-center"
            priority
            quality={90}
          />
          {/* Warm editorial overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          <div className="absolute inset-0 bg-[hsl(24,40%,30%)]/20 mix-blend-multiply" />
        </div>

        <Container className="relative z-10 py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title — light serif, editorial feel */}
            <h1
              ref={titleRef}
              className="mb-8 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-white leading-[1.1] drop-shadow-lg"
              style={{ perspective: '1000px' }}
            >
              Travel Agencies: Join the Future
            </h1>

            {/* Subtitle — honest, clear */}
            <p className="hero-subtitle mb-12 max-w-2xl mx-auto text-lg sm:text-xl text-white/85 leading-relaxed font-light">
              Login and activate your <strong className="text-accent">FREE BETA plan</strong> to showcase your routes with immersive journeys. Let travelers connect directly with your agency.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/login"
                className="hero-cta inline-flex items-center gap-3 px-8 py-4 bg-accent text-white text-sm tracking-[0.15em] uppercase font-semibold rounded-full hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30 transition-all duration-500"
              >
                Agency Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="hero-cta inline-flex items-center gap-3 px-8 py-4 border border-white/30 text-white text-sm tracking-[0.15em] uppercase font-medium rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-500 backdrop-blur-sm"
              >
                Join Beta (Free)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Container>

        {/* Scroll indicator — animated thin line */}
        <div className="hero-scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="text-white/50 text-xs tracking-[0.2em] uppercase font-light">Scroll</span>
          <div className="w-px h-12 bg-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/60 animate-scroll-indicator" />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES — Split Editorial Layout ═══════════ */}
      <section ref={featuresRef} className="py-28 md:py-36">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left — atmospheric image */}
            <div className="feature-image relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src={getAssetPath("/images/premium-tea.png")}
                alt="Tea estate in Darjeeling"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Right — numbered feature list */}
            <div className="space-y-12">
              <div>
                <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4 font-medium">For Travel Agencies</p>
                <h2 className="text-4xl sm:text-5xl leading-tight">
                  Showcase Your Routes
                </h2>
              </div>

              {[
                {
                  num: '01',
                  title: 'Premium Immersive Experience',
                  desc: 'Showcase your routes with 1,920 scroll-driven frames. Travelers experience the journey before booking.'
                },
                {
                  num: '02',
                  title: 'Direct Customer Connection',
                  desc: 'Your contact details (WhatsApp, phone, email) are displayed on every route you list. No middlemen.'
                },
                {
                  num: '03',
                  title: 'Free Beta Access',
                  desc: 'Join now and activate your FREE beta plan. Login, list routes, and start connecting with travelers.'
                },
              ].map((feature) => (
                <div key={feature.num} className="feature-item flex gap-6 group">
                  <span className="text-accent text-sm font-medium tracking-wider mt-1.5 shrink-0">{feature.num}</span>
                  <div>
                    <h3 className="text-xl mb-2 group-hover:text-accent transition-colors duration-300">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════ GALLERY — No header, larger images ═══════════ */}
      <ScrollingGallery />

      {/* ═══════════ ROUTES — Asymmetric Magazine Grid ═══════════ */}
      <section ref={routesRef} id="routes" className="py-28 md:py-36">
        <Container>
          <div className="mb-16">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4 font-medium">Featured Routes</p>
            <h2 className="text-4xl sm:text-5xl mb-4">
              Agencies on PathSathi
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg">
              Browse routes from verified travel agencies. Click to see details and connect with the agency directly.
            </p>
          </div>

          {/* Asymmetric grid */}
          <div className="grid md:grid-cols-2 gap-6">
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
                    className={`route-card group block ${isLarge ? 'md:col-span-2' : ''}`}
                  >
                    <div className={`relative overflow-hidden rounded-2xl bg-card ${isLarge ? 'h-[500px]' : 'h-[400px]'}`}>
                      {/* Image */}
                      <Image
                        src={getAssetPath(route.heroImage || "/images/mountain_road_journey_1770289426463.png")}
                        alt={route.title}
                        fill
                        className="route-image object-cover transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Content overlay at bottom */}
                      <div className="route-content absolute inset-x-0 bottom-0 p-8 transition-transform duration-500">
                        <h3 className="font-display text-3xl sm:text-4xl text-white mb-3 leading-tight">
                          {route.title}
                        </h3>
                        <p className="text-white/70 mb-5 max-w-lg">
                          {route.subtitle}
                        </p>

                        <div className="flex flex-col gap-4">
                          {/* Stats Row */}
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60 font-medium">
                            {route.distanceKm && (
                              <div className="flex items-center gap-1.5 tracking-[0.1em] uppercase">
                                <MapPin className="w-3.5 h-3.5 text-white/40" />
                                <span>{route.distanceKm} km</span>
                              </div>
                            )}
                            {route.durationHours && (
                              <div className="flex items-center gap-1.5 tracking-[0.1em] uppercase">
                                <Clock className="w-3.5 h-3.5 text-white/40" />
                                <span>{route.durationHours} hrs</span>
                              </div>
                            )}
                            {(route.sponsorCount ?? 0) > 0 && (
                              <div className="flex items-center gap-1.5 tracking-[0.1em] uppercase bg-accent/20 px-3 py-1 rounded-full border border-accent/30">
                                <Users className="w-3.5 h-3.5 text-accent" />
                                <span className="text-accent font-semibold">{route.sponsorCount} {route.sponsorCount === 1 ? 'agency' : 'agencies'} available</span>
                              </div>
                            )}
                          </div>

                          {/* Action Row */}
                          <div className="flex items-center justify-end border-t border-white/10 pt-4 mt-2">
                            <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                              <span className="tracking-[0.15em] uppercase text-sm font-semibold">Explore</span>
                              <ArrowRight className="w-4 h-4" />
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

      {/* ═══════════ CTA — Dark navy, honest copy ═══════════ */}
      <section className="cta-section relative py-32 md:py-40 overflow-hidden bg-[hsl(var(--primary))]">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={getAssetPath("/images/sikkim_monastery_1770289444287.png")}
            alt="Sikkim monastery"
            fill
            className="object-cover"
          />
        </div>

        <Container className="relative z-10 text-center">
          <h2 className="cta-title font-display text-4xl sm:text-5xl md:text-6xl text-white/95 mb-6 leading-tight">
            Ready to showcase your routes?
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join PathSathi today. Login to activate your FREE beta plan and start connecting with travelers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary text-sm tracking-[0.15em] uppercase font-semibold rounded-full hover:bg-white/90 hover:shadow-xl transition-all duration-500"
            >
              Agency Login
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 border border-white/25 text-white text-sm tracking-[0.15em] uppercase font-medium rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-500"
            >
              Join Beta (Free)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  )
}
