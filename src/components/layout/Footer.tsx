"use client";

import Link from "next/link";
import { Mountain, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-t border-border/50">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <Mountain className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">PathSathi</span>
                        </Link>
                        <p className="text-muted-foreground max-w-md leading-relaxed mb-4">
                            Discover the enchanting beauty of North Bengal, Darjeeling, and Sikkim through immersive 3D journey experiences.
                        </p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Siliguri, West Bengal, India</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                <a href="mailto:info@pathsathi.com" className="hover:text-primary transition-colors">
                                    info@pathsathi.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                <a href="tel:+911234567890" className="hover:text-primary transition-colors">
                                    +91 1234 567 890
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            {["About Us", "Routes", "Travel Agencies", "Contact"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Partners */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">For Partners</h3>
                        <ul className="space-y-3">
                            {["Become a Partner", "Agency Login", "List Your Route", "Terms & Conditions"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {currentYear} PathSathi. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <Link href="/privacy" className="hover:text-primary transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-primary transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
