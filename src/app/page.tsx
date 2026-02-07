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

    // ── Magic section — stagger reveal ──
    const magicSteps = gsap.utils.toArray<HTMLElement>('.magic-step')
    magicSteps.forEach((step, i) => {
      gsap.from(step, {
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 40,
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
      y: 60,
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
        y: 40,
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
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2
    })

  }, { scope: heroRef, dependencies: [] })

  return (
    <main ref={heroRef} className="relative overflow-hidden">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with warm overlay */}
        <div className="hero-bg-layer absolute inset-0 -z-10">
          <Image
            src={getAssetPath("/images/darjeeling_hero_bg_1770289408859.webp")}
            alt="Darjeeling mountains hero background"
            fill
            className="hero-bg-image object-cover"
            priority
          />
          {/* Warm editorial overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          <div className="absolute inset-0 bg-[hsl(24,40%,30%)]/10 mix-blend-multiply" />
        </div>

        <Container className="relative z-10 py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title — light serif, editorial feel */}
            <h1
              ref={titleRef}
              className="mb-8 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-white leading-[1.1] drop-shadow-lg"
              style={{ perspective: '1000px' }}
            >
              The Journey Begins<br />Before You Leave.
            </h1>

            {/* Subtitle — honest, clear */}
            <p className="hero-subtitle mb-12 max-w-2xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed font-light text-balance">
              Experience your next adventure through an immersive 3D visual odyssey. Scroll through routes, discover hidden gems, and connect directly with the experts who lead the way.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button
                onClick={() => {
                  document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hero-cta inline-flex items-center gap-3 px-8 py-4 bg-white text-primary text-sm tracking-[0.15em] uppercase font-semibold rounded-full hover:bg-white/90 hover:shadow-xl transition-all duration-500"
              >
                Explore Routes
                <MapPin className="w-4 h-4" />
              </button>
              <Link
                href="/signup"
                className="hero-cta inline-flex items-center gap-3 px-8 py-4 bg-accent/90 text-white text-sm tracking-[0.15em] uppercase font-medium rounded-full hover:bg-accent hover:shadow-lg hover:shadow-accent/30 transition-all duration-500 backdrop-blur-sm border border-transparent"
              >
                List Your Agency — Free
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

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

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
              <div key={item.step} className="magic-step relative text-center group">
                {/* Step Number Circle */}
                <div className="w-24 h-24 mx-auto bg-white border border-border rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:border-accent/50 group-hover:shadow-lg group-hover:shadow-accent/10 transition-all duration-500">
                  <span className="font-display text-3xl text-primary group-hover:text-accent transition-colors duration-300">{item.step}</span>
                </div>

                <h3 className="text-2xl font-display text-primary mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed px-4 text-balance">
                  {item.desc}
                </p>
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

      {/* ═══════════ B2B SECTION — For Travel Agencies ═══════════ */}
      <section className="relative py-32 md:py-40 overflow-hidden bg-[hsl(220,40%,10%)] text-white">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <Image
            src={getAssetPath("/images/sikkim_monastery_1770289444287.png")}
            alt="Background texture"
            fill
            className="object-cover grayscale"
          />
        </div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Pitch */}
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent text-xs font-bold tracking-widest uppercase mb-6 border border-accent/20">
                For Agency Owners
              </span>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-[1.1]">
                Travel Agencies:<br />Join the Future of Itineraries.
              </h2>
              <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-xl">
                Stop sending boring PDFs. Showcase your expertise in high-definition 3D. Give your clients a reason to book with you.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-white text-sm tracking-[0.15em] uppercase font-bold rounded-full hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 transition-all duration-500"
                >
                  Activat Free Beta Plan
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white text-sm tracking-[0.15em] uppercase font-medium rounded-full hover:bg-white/10 transition-all duration-500"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* Right: Features Grid */}
            <div className="grid gap-8">
              {[
                {
                  title: "Immersive Sales",
                  desc: "Let travelers 'feel' the drive before they book. Higher engagement means higher conversion."
                },
                {
                  title: "Direct Leads",
                  desc: "Your WhatsApp, Phone, and Email are front-and-center. We send the customer straight to you."
                },
                {
                  title: "Zero Commission",
                  desc: "We aren't a booking engine; we are a bridge. You keep 100% of your profits."
                }
              ].map((feature, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-accent font-display text-2xl">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-display mb-2 text-white">{feature.title}</h3>
                    <p className="text-white/50 leading-relaxed text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      {/* ═══════════ CUSTOM PATH SECTION ═══════════ */}
      <RequestSection />

      {/* ═══════════ TRUST & SOCIAL PROOF ═══════════ */}
      <section className="relative py-24 text-center overflow-hidden">
        {/* Background Image with Filter */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={getAssetPath("/images/footer_bg.webp")}
            alt="Siliguri Mountains"
            fill
            className="object-cover brightness-[0.4] grayscale-[20%]"
          />
        </div>

        <Container>
          <h3 className="footer-reveal-title font-display text-3xl text-white mb-4">
            Crafted in Siliguri. Built for the Mountains.
          </h3>
          <p className="footer-reveal-text text-white/80 text-lg font-light max-w-xl mx-auto italic">
            "For every road that leads to the mountains, there is a story. We help you tell it."
          </p>
        </Container>
      </section>
    </main>
  )
}
