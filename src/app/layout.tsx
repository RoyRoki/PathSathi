import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Configure fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PathSathi",
  description: "Scroll-driven 3D journey experiences for travel routes.",
};

// import { CustomCursor } from "@/components/ui/CustomCursor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased min-h-screen flex flex-col noise-bg px-0">
        {/* <CustomCursor /> */}
        <Navbar />
        <SmoothScroll>
          <div className="flex-1">
            {children}
            <Footer />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
