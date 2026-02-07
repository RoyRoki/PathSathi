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

            {/* Main Content - Relative & Z-10 to cover footer */}
            <main className="relative z-10 bg-background shadow-2xl mb-[80vh] md:mb-[60vh] lg:mb-[50vh]">
                {children}
            </main>

            {/* Sticky Reveal Footer - Fixed & Z-0 */}
            {!isAdminRoute && (
                <div className="fixed bottom-0 left-0 w-full z-0 h-[80vh] md:h-[60vh] lg:h-[50vh] flex flex-col justify-end">
                    <Footer variant="ghost" />
                </div>
            )}
            {/* </SmoothScroll> */}
        </body>
    );
}
