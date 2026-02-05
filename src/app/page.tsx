'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Clock, Mountain, Sparkles, Award, Users } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import routes from '@/data/routes/routes.json'
import { ScrollingGallery } from '@/components/ui/ScrollingGallery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import SplitType from 'split-type'

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const routesRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    // Split text for character animation
    if (titleRef.current) {
      const split = new SplitType(titleRef.current, {
        types: 'chars,words',
        tagName: 'span'
      })

      // Title character reveal with sophisticated stagger
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      tl.from('.hero-badge', {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(2)',
        delay: 0.5,
      })
        .from(split.chars, {
          yPercent: 130,
          opacity: 0,
          rotateX: -90,
          stagger: {
            each: 0.03,
            from: 'start',
          },
          duration: 1.2,
          ease: 'power4.out',
        }, '-=0.3')
        .from('.hero-subtitle', {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        }, '-=0.8')
        .from('.hero-cta', {
          y: 40,
          opacity: 0,
          scale: 0.9,
          stagger: 0.1,
          duration: 0.8,
          ease: 'back.out(1.5)',
        }, '-=0.5')
        .from('.hero-stats', {
          y: 30,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
        }, '-=0.4')
    }

    // Parallax effects
    gsap.to('.hero-bg-layer-1', {
      yPercent: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    })

    gsap.to('.hero-bg-layer-2', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    })

    // Features section
    // Features section - Individual triggers for reliability
    const featureCards = gsap.utils.toArray<HTMLElement>('.feature-card')
    featureCards.forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%', // Trigger when top of card is 90% down viewport
          toggleActions: 'play none none reverse',
        },
        y: 80,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        delay: i * 0.15, // Manual stagger
        ease: 'power3.out',
      })
    })

    // Routes cards with magnetic effect setup
    const cards = gsap.utils.toArray<HTMLElement>('.route-card')

    cards.forEach((card) => {
      const image = card.querySelector('.route-image') as HTMLElement
      const content = card.querySelector('.route-content') as HTMLElement

      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          gsap.from(card, {
            y: 120,
            opacity: 0,
            scale: 0.92,
            duration: 1.2,
            ease: 'power4.out',
          })
        },
        once: true,
      })

      // Hover effect
      card.addEventListener('mouseenter', () => {
        gsap.to(image, {
          scale: 1.15,
          duration: 0.8,
          ease: 'power2.out',
        })
        gsap.to(content, {
          y: -8,
          duration: 0.6,
          ease: 'power2.out',
        })
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(image, {
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
        })
        gsap.to(content, {
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        })
      })
    })

  }, { scope: heroRef, dependencies: [] })

  return (
    <main ref={heroRef} className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Multi-layer parallax background */}
        <div className="absolute inset-0 -z-10">
          <div className="hero-bg-layer-1 absolute inset-0">
            <Image
              src="/images/darjeeling_hero_bg_1770289408859.png"
              alt="Darjeeling mountains"
              fill
              className="object-cover"
              priority
              quality={95}
            />
          </div>
          <div className="hero-bg-layer-2 absolute inset-0 bg-gradient-to-br from-black/60 via-primary/30 to-secondary/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        <Container className="relative z-10 py-32 px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Premium badge */}
            <Badge
              className="hero-badge mb-8 px-6 py-3 text-base font-medium bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white shadow-2xl hover:bg-white/20 transition-all"
            >
              <Award className="w-5 h-5 mr-2 text-accent" />
              Premium Himalayan Experiences
            </Badge>

            {/* Title with character-by-character reveal */}
            <h1
              ref={titleRef}
              className="mb-8 font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-2xl"
              style={{ perspective: '1000px' }}
            >
              Journey Through North Bengal's Hidden Trails
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle mb-12 max-w-3xl mx-auto text-xl sm:text-2xl text-white/95 leading-relaxed font-light tracking-wide drop-shadow-lg">
              Embark on curated expeditions through mist-laden tea estates, ancient monasteries, and winding Himalayan passes
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button
                size="lg"
                className="hero-cta h-16 px-10 text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-2xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Sparkles className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10">Begin Your Journey</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform relative z-10" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="hero-cta h-16 px-10 text-lg font-semibold border-2 border-white/40 bg-white/5 hover:bg-white/15 text-white backdrop-blur-xl shadow-2xl"
              >
                <Mountain className="w-6 h-6 mr-3" />
                Explore Routes
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
              {[
                { icon: Mountain, label: 'Routes', value: '12+' },
                { icon: Users, label: 'Travelers', value: '5000+' },
                { icon: Award, label: 'Rating', value: '4.9' },
              ].map((stat, i) => (
                <div key={i} className="hero-stats group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
                    <stat.icon className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/70 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Features Section - Premium Design */}
      <section ref={featuresRef} className="py-32 relative bg-gradient-to-b from-background via-muted/20 to-background">
        <Container>
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/30">
              Why PathSathi
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground via-primary to-secondary bg-clip-text text-transparent">
              Crafted for Discerning Travelers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Experience travel planning redefined through technology and local expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mountain,
                title: '3D Route Previews',
                description: 'Immersive scroll-driven visualizations let you experience every turn before you travel',
                gradient: 'from-primary/10 to-primary/5',
                iconBg: 'bg-primary/10',
                iconColor: 'text-primary'
              },
              {
                icon: Award,
                title: 'Verified Partners',
                description: 'Handpicked local agencies committed to authentic, sustainable tourism',
                gradient: 'from-accent/10 to-accent/5',
                iconBg: 'bg-accent/10',
                iconColor: 'text-accent'
              },
              {
                icon: Sparkles,
                title: 'Seamless Booking',
                description: 'From discovery to departure, every step is thoughtfully designed',
                gradient: 'from-secondary/10 to-secondary/5',
                iconBg: 'bg-secondary/10',
                iconColor: 'text-secondary'
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className={`feature-card group relative overflow-hidden border-none shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br ${feature.gradient}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 pt-10">
                  <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl mb-4">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Auto-scrolling Gallery Section */}
      <ScrollingGallery />

      {/* Routes Section - Magazine Layout */}
      <section ref={routesRef} id="routes" className="py-32 bg-gradient-to-b from-background to-primary/5">
        <Container>
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-2 border-accent/30">
              Signature Journeys
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">
              Curated Expeditions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Each route tells a story of culture, nature, and timeless beauty
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {routes.map((route) => (
              <Link key={route.id} href={`/routes/${route.slug}`} className="route-card group block">
                <div className="relative overflow-hidden rounded-3xl bg-card shadow-xl hover:shadow-2xl transition-all duration-700">
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src="/images/mountain_road_journey_1770289426463.png"
                      alt={route.title}
                      fill
                      className="route-image object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Floating badge */}
                    <Badge className="absolute top-6 right-6 px-4 py-2 bg-white/90 text-foreground backdrop-blur-sm shadow-lg">
                      <Users className="w-4 h-4 mr-2" />
                      {route.sponsorCount || 0} Agencies
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="route-content relative p-8">
                    <h3 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {route.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {route.subtitle}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">{route.distanceKm} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span className="font-medium">{route.durationHours} hrs</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                        <span>Discover</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA - Full bleed */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/sikkim_monastery_1770289444287.png"
            alt="Sikkim monastery"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-accent/70" />
        </div>

        <Container className="relative z-10 text-center text-white">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 drop-shadow-2xl">
            Your Journey Awaits
          </h2>
          <p className="text-2xl mb-12 max-w-3xl mx-auto font-light text-white/95 drop-shadow-lg">
            Join a community of explorers discovering the soul of the Himalayas
          </p>
          <Button
            size="lg"
            className="h-16 px-12 text-xl font-semibold bg-white text-primary hover:bg-white/90 hover:scale-105 shadow-2xl transition-all"
          >
            Start Planning Today
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </Container>
      </section>
    </main>
  )
}
