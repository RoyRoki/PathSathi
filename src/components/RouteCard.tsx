import { RouteInfo } from "@/lib/types";

export function RouteCard({ route }: { route: RouteInfo }) {
  const featured = route.featuredAgencyId ?? route.agencies[0]?.id;
  const available = Boolean(featured) || (route.sponsorCount ?? 0) > 0;
  const href = featured
    ? `/routes/${route.slug}?tid=${featured}`
    : `/routes/${route.slug}`;

  return (
    <a
      href={href}
      className="clay-card group flex h-full flex-col justify-between rounded-3xl border border-white/60 p-6 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {available
            ? `${route.sponsorCount ?? route.agencies.length} Agency Live`
            : "Open Route"}
        </div>
        <h3 className="mt-3 text-xl font-semibold">{route.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{route.subtitle}</p>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>{route.distanceKm ? `${route.distanceKm} km` : "—"}</span>
        <span>{route.durationHours ? `${route.durationHours} hrs` : "—"}</span>
        <span className="text-foreground">Explore →</span>
      </div>
    </a>
  );
}
