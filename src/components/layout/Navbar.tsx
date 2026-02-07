"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    const pathname = usePathname();
    const isRoutePage = pathname?.startsWith("/routes/");
    // Check for exact match or trailing slash
    const isAuthPage = pathname === "/login" || pathname === "/login/" || pathname === "/signup" || pathname === "/signup/";
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");
    const shouldHideNavbar = isRoutePage || isAuthPage || isDashboard;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useGSAP(() => {
        if (!navRef.current || shouldHideNavbar) return;
        gsap.from(navRef.current, {
            y: -30,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            clearProps: "all",
        });
    }, { scope: navRef, dependencies: [shouldHideNavbar] });

    const navLinks = [
        { href: "/#routes", label: "Routes" },
        { href: "/#how-it-works", label: "How It Works" },
        { href: "/login", label: "For Agencies" },
    ];

    if (shouldHideNavbar) return null;

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? "bg-white/95 backdrop-blur-xl border-b border-border/60"
                : "bg-transparent"
                }`}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex items-center justify-between h-18 py-5">
                    {/* Logo — text-only, Playfair Display */}
                    <Link href="/" className="group">
                        <span
                            className={`font-display text-2xl tracking-tight transition-colors duration-300 ${isScrolled ? "text-foreground" : "text-white"
                                }`}
                        >
                            PathSathi
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative text-sm tracking-[0.05em] font-medium transition-all duration-300 ${isScrolled
                                    ? "text-foreground/70 hover:text-foreground"
                                    : "text-white/80 hover:text-white"
                                    } group`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-0.5 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${isScrolled ? "bg-foreground" : "bg-white"
                                        }`}
                                />
                            </Link>
                        ))}
                    </div>

                    {/* CTA — text link style */}
                    <div className="hidden md:block">
                        <Link
                            href="#routes"
                            className={`text-sm tracking-[0.05em] font-medium transition-colors duration-300 ${isScrolled
                                ? "text-accent hover:text-accent/80"
                                : "text-white/90 hover:text-white"
                                }`}
                        >
                            Plan a Journey
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden p-2 rounded-lg transition-all ${isScrolled
                            ? "text-foreground hover:bg-muted"
                            : "text-white hover:bg-white/10"
                            }`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu — bottom sheet style */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-t border-border/50"
                    >
                        <div className="px-6 py-6 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block py-3 text-foreground/80 hover:text-foreground transition-colors font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-border/50">
                                <Link
                                    href="#routes"
                                    className="block py-3 text-accent font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Plan a Journey
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
