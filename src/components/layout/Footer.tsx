"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Instagram, Linkedin, Mail } from "lucide-react";

interface FooterProps {
    variant?: "default" | "ghost";
}

export function Footer({ variant = "default" }: FooterProps) {
    const isGhost = variant === "ghost";

    const linkGroups = [
        {
            title: "Routes",
            links: [
                { label: "North Bengal", href: "/coming-soon" },
                { label: "Sikkim", href: "/coming-soon" },
                { label: "Darjeeling", href: "/routes/siliguri-kurseong-darjeeling" },
                { label: "Bhutan", href: "/coming-soon" },
                { label: "Offbeat Stays", href: "/coming-soon" },
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
        <footer className={cn(
            "border-t transition-colors duration-300",
            isGhost
                ? "bg-[#F9FAFB] text-[#2C3E50] border-black/5"
                : "bg-[hsl(var(--primary))] text-white/70 border-white/10"
        )}>
            <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <span className={cn(
                                "font-display text-2xl tracking-tight",
                                isGhost ? "text-primary" : "text-white"
                            )}>PathSathi</span>
                        </Link>
                        <p className={cn(
                            "text-sm leading-relaxed max-w-xs",
                            isGhost ? "text-muted-foreground" : "text-white/50"
                        )}>
                            Crafted in Siliguri. Built for the Mountains.
                        </p>
                    </div>

                    {/* Link groups */}
                    {linkGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className={cn(
                                "text-sm font-medium tracking-[0.1em] uppercase mb-5",
                                isGhost ? "text-primary/80" : "text-white/90"
                            )}>
                                {group.title}
                            </h3>
                            <ul className="space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "text-sm transition-colors duration-300",
                                                isGhost
                                                    ? "text-muted-foreground hover:text-primary"
                                                    : "text-white/50 hover:text-white/80"
                                            )}
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
                <div className={cn(
                    "pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4",
                    isGhost ? "border-black/5" : "border-white/10"
                )}>
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className={cn(
                            "text-xs",
                            isGhost ? "text-muted-foreground/60" : "text-white/30"
                        )}>
                            &copy; 2026 PathSathi. All rights reserved.
                        </p>
                        <p className={cn(
                            "text-xs",
                            isGhost ? "text-muted-foreground/60" : "text-white/30"
                        )}>
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Siliguri,+West+Bengal,+India"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                            >
                                Siliguri, West Bengal, India
                            </a>
                        </p>
                    </div>

                    {/* Developer Credit */}
                    <div className="flex items-center gap-4">
                        <span className={cn(
                            "text-xs font-medium uppercase tracking-wider",
                            isGhost ? "text-muted-foreground/40" : "text-white/20"
                        )}>
                            Developed by Roki Roy
                        </span>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://instagram.com/rokiroydev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "transition-colors hover:scale-110 transform duration-200",
                                    isGhost ? "text-muted-foreground/60 hover:text-[#E1306C]" : "text-white/40 hover:text-white"
                                )}
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a
                                href="https://linkedin.com/in/RokiRoy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "transition-colors hover:scale-110 transform duration-200",
                                    isGhost ? "text-muted-foreground/60 hover:text-[#0077B5]" : "text-white/40 hover:text-white"
                                )}
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="mailto:rokiroydev@gmail.com"
                                className={cn(
                                    "transition-colors hover:scale-110 transform duration-200",
                                    isGhost ? "text-muted-foreground/60 hover:text-[#EA4335]" : "text-white/40 hover:text-white"
                                )}
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
