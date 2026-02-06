import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { LayoutClient } from "@/components/LayoutClient";

// Configure fonts — Editorial serif + clean sans
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PathSathi — Scroll-Driven Journeys Through North Bengal & Sikkim",
  description: "Immersive scroll-driven travel experiences through Darjeeling, Sikkim, and North Bengal. Explore routes, connect with verified local agencies, and plan your mountain journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} light`}
    >
      <LayoutClient>{children}</LayoutClient>
    </html>
  );
}
