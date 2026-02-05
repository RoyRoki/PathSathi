"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Mountain, Menu, X, Sparkles } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useGSAP(() => {
        gsap.from(navRef.current, {
            y: -40,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out',
            clearProps: "all"
        })
    }, { scope: navRef })

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/#routes", label: "Journeys" }
    ];

    const pathname = usePathname();
    const isRoutePage = pathname?.startsWith("/routes/");

    if (isRoutePage) return null;

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? "bg-white/95 dark:bg-background/95 backdrop-blur-2xl shadow-xl border-b border-border/50"
                : "bg-transparent"
                }`}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isScrolled
                            ? "bg-gradient-to-br from-primary to-secondary"
                            : "bg-white/10 backdrop-blur-md border border-white/30"
                            } group-hover:scale-110 group-hover:rotate-6`}>
                            <Mountain className={`w-6 h-6 ${isScrolled ? "text-white" : "text-white"}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled ? "text-foreground" : "text-white drop-shadow-lg"
                                }`}>
                                PathSathi
                            </span>
                            <span className={`text-[10px] font-medium tracking-wider uppercase ${isScrolled ? "text-muted-foreground" : "text-white/70"
                                }`}>
                                Himalayan Journeys
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link, i) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative font-semibold text-[15px] transition-all duration-300 hover:scale-105 ${isScrolled
                                    ? "text-foreground/80 hover:text-primary"
                                    : "text-white/95 hover:text-white drop-shadow-md"
                                    } group`}
                            >
                                {link.label}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled ? "bg-primary" : "bg-white"
                                    }`} />
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login">
                            <Button
                                variant={isScrolled ? "ghost" : "ghost"}
                                size="default"
                                className={`font-semibold ${isScrolled
                                    ? "text-foreground hover:bg-muted"
                                    : "text-white hover:bg-white/10"
                                    }`}
                            >
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button
                                size="default"
                                className={`font-semibold shadow-lg transition-all hover:scale-105 ${isScrolled
                                    ? "bg-primary hover:bg-primary/90 text-white"
                                    : "bg-white text-primary hover:bg-white/90"
                                    }`}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden p-2.5 rounded-xl transition-all ${isScrolled
                            ? "text-foreground hover:bg-muted"
                            : "text-white hover:bg-white/10 backdrop-blur-sm"
                            }`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-2xl shadow-2xl">
                    <div className="px-6 py-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-3 text-lg font-semibold text-foreground/80 hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 space-y-3 border-t border-border/50">
                            <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button
                                    variant="outline"
                                    size="default"
                                    className="w-full font-semibold"
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button
                                    size="default"
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
