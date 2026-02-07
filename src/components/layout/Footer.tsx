"use client";

import Link from "next/link";

export function Footer() {


    const linkGroups = [
        {
            title: "Routes",
            links: [
                { label: "North Bengal", href: "/routes/north-bengal" },
                { label: "Sikkim", href: "/routes/sikkim" },
                { label: "Bhutan", href: "/routes/types/bhutan" },
                { label: "Offbeat Stays", href: "/routes/types/offbeat" },
            ],
        },
        {
            title: "Agencies",
            links: [
                { label: "Partner With Us", href: "/signup" },
                { label: "Agency Login", href: "/login" },
                { label: "Documentation", href: "/docs" },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "Our Story", href: "/about" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
            ],
        },
    ];

    return (
        <footer className="bg-[hsl(var(--primary))] text-white/70 border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <span className="font-display text-2xl text-white tracking-tight">PathSathi</span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                            Crafted in Siliguri. Built for the Mountains.
                        </p>
                    </div>

                    {/* Link groups */}
                    {linkGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-white/90 text-sm font-medium tracking-[0.1em] uppercase mb-5">
                                {group.title}
                            </h3>
                            <ul className="space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/50 hover:text-white/80 transition-colors duration-300"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/30">
                        &copy; 2026 PathSathi. All rights reserved.
                    </p>
                    <p className="text-xs text-white/30">
                        Siliguri, West Bengal, India
                    </p>
                </div>
            </div>
        </footer>
    );
}
