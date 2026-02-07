"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { GitHubPagesRedirect } from "@/components/GitHubPagesRedirect";

export function LayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");

    return (
        <body className="font-sans bg-background text-foreground antialiased min-h-screen flex flex-col noise-bg px-0">
            <GitHubPagesRedirect />
            {/* <CustomCursor /> */}
            {!isAdminRoute && <Navbar />}
            {/* <SmoothScroll> */}
            <div className="flex-1">
                {children}
                {!isAdminRoute && <Footer />}
            </div>
            {/* </SmoothScroll> */}
        </body>
    );
}
