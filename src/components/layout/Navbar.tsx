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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled
                ? "top-4 mx-4 md:mx-auto md:max-w-5xl rounded-full bg-white/70 backdrop-blur-[16px] border border-white/40 shadow-lg shadow-black/5"
                : "bg-transparent border-transparent py-4"
                }`}
        >
            <div className={`mx-auto px-6 lg:px-8 transition-all duration-500 ${isScrolled ? "py-3" : "py-4"} `}>
                <div className="flex items-center justify-between">
                    {/* Logo — Shimmer Effect */}
                    <Link href="/" className="group relative overflow-hidden">
                        <span
                            className={`font-display text-2xl tracking-tight transition-colors duration-300 relative z-10 ${isScrolled ? "text-primary" : "text-white"
                                }`}
                        >
                            PathSathi
                        </span>
                        {/* Shimmer overlay */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-[150%] group-hover:animate-shimmer z-20 mix-blend-overlay pointer-events-none" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm tracking-[0.1em] uppercase font-medium transition-all duration-300 ${isScrolled
                                    ? "text-primary/80 hover:text-primary"
                                    : "text-white/80 hover:text-white"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:block">
                        <Link
                            href="#routes"
                            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.1em] uppercase transition-all duration-300 border ${isScrolled
                                ? "bg-primary text-white border-primary hover:bg-primary/90 hover:shadow-lg"
                                : "bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md"
                                }`}
                        >
                            Plan Journey
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden p-2 rounded-full transition-all ${isScrolled
                            ? "text-primary hover:bg-secondary/10"
                            : "text-white hover:bg-white/10"
                            }`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu — Detached & Glassmorphic */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full mt-2 left-0 right-0 p-4"
                    >
                        <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-6 overflow-hidden">
                            <div className="flex flex-col space-y-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-lg font-display text-primary hover:text-accent transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="h-px bg-border/50 my-2" />
                                <Link
                                    href="#routes"
                                    className="text-lg font-display text-accent"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Plan Journey
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
