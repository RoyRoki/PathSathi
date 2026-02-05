"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GridSkeleton } from "@/components/ui";

// Mock route data (replace with actual Firestore data)
const mockRoutes = [
  {
    id: "siliguri-darjeeling",
    title: "Siliguri to Darjeeling",
    subtitle: "Himalayan Mountain Adventure",
    slug: "siliguri-darjeeling",
    distance_km: 78,
    duration_hours: 3,
    sponsor_count: 2
  },
  {
    id: "kolkata-sundarbans",
    title: "Kolkata to Sundarbans",
    subtitle: "Mangrove Forest Journey",
    slug: "kolkata-sundarbans",
    distance_km: 110,
    duration_hours: 4,
    sponsor_count: 1
  }
];

export function RoutesGrid() {
  const [routes, setRoutes] = useState<typeof mockRoutes>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setRoutes(mockRoutes);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <GridSkeleton count={2} />;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route, index) => (
        <motion.a
          key={route.id}
          href={`/routes/${route.slug}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          whileHover={{ y: -4 }}
          className="group clay-card rounded-2xl p-6 transition-all duration-300 block"
        >
          {/* Hero Image Placeholder */}
          <div className="w-full h-40 bg-gradient-bg-primary rounded-xl mb-4 flex items-center justify-center overflow-hidden">
            <svg
              className="w-12 h-12 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>

          {/* Content */}
          <h3 className="font-semibold text-xl mb-2 group-hover:text-accent transition-colors">
            {route.title}
          </h3>
          <p className="text-sm text-ink/70 mb-4">{route.subtitle}</p>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4 text-ink/60">
              <span>📍 {route.distance_km} km</span>
              <span>⏱️ {route.duration_hours} hrs</span>
            </div>
            {route.sponsor_count > 0 && (
              <div className="flex items-center gap-1 text-teal">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{route.sponsor_count} Sponsor{route.sponsor_count > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Hover Arrow */}
          <div className="mt-4 flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium">View Journey</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
