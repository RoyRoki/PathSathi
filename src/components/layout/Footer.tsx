"use client";

import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const linkGroups = [
        {
            title: "Routes",
            links: [
                { label: "Siliguri to Darjeeling", href: "/routes/siliguri-kurseong-darjeeling" },
                { label: "Kolkata to Sundarbans", href: "/routes/kolkata-sundarbans" },
                { label: "All Routes", href: "/#routes" },
            ],
        },
        {
            title: "For Agencies",
            links: [
                { label: "Partner With Us", href: "/login" },
                { label: "Agency Login", href: "/login" },
                { label: "List a Route", href: "/login" },
            ],
        },
        {
            title: "About",
            links: [
                { label: "How It Works", href: "/#features" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
            ],
        },
    ];

    return (
        <footer className="bg-[hsl(var(--primary))] text-white/70">
            <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <span className="font-display text-2xl text-white tracking-tight">PathSathi</span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                            Crafted in Siliguri. For every road that leads to the mountains.
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
                        &copy; {currentYear} PathSathi. All rights reserved.
                    </p>
                    <p className="text-xs text-white/30">
                        Siliguri, West Bengal, India
                    </p>
                </div>
            </div>
        </footer>
    );
}
