"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { GitHubPagesRedirect } from "@/components/GitHubPagesRedirect";

export function LayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");
    return (
        <body className="font-sans bg-background text-foreground antialiased min-h-[100dvh] flex flex-col noise-bg px-0">
            <GitHubPagesRedirect />
            {/* <CustomCursor /> */}
            {!isAdminRoute && <Navbar />}
            {/* <SmoothScroll> */}

            {/* Main Content */}
            <div className="flex-1 bg-background relative flex flex-col">
                {children}
            </div>

            {/* Standard Footer */}
            {!isAdminRoute && <Footer variant="ghost" />}
            {/* </SmoothScroll> */}
        </body>
    );
}
