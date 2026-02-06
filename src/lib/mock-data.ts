import { RouteInfo } from "./types";
import { getAssetPath } from "./utils";

export const routes: RouteInfo[] = [
  {
    id: "route-001",
    slug: "siliguri-to-darjeeling-via-mirik",
    title: "Siliguri → Darjeeling via Mirik",
    subtitle: "Lakeside bends, tea gardens, and misty ridge lines.",
    distanceKm: 70,
    durationHours: 3.5,
    heroImage: "/placeholders/mirik.webp",
    assetFolder: "routes/siliguri-darjeeling-mirik",
    totalFrames: 240,
    agencies: [
      {
        id: "ag-101",
        name: "Himalaya Trails",
        phone: "+91 98765 43210",
        email: "hello@himalayatrails.in",
        website: "https://himalayatrails.in",
        address: "Tenzing Norgay Road, Darjeeling",
        whatsapp: "+91 98765 43210",
        isVerified: true
      }
    ]
  },
  {
    id: "route-002",
    slug: "siliguri-to-kalimpong-ridge",
    title: "Siliguri → Kalimpong Ridge",
    subtitle: "Rolling valleys and quiet ridge view points.",
    distanceKm: 78,
    durationHours: 3.8,
    heroImage: "/placeholders/kalimpong.webp",
    assetFolder: "routes/siliguri-kalimpong",
    totalFrames: 220,
    agencies: []
  },
  {
    id: "route-003",
    slug: "siliguri-kurseong-darjeeling",
    title: "Siliguri → Darjeeling",
    subtitle: "Himalayan Mountain Adventure",
    distanceKm: 78,
    durationHours: 3,
    heroImage: getAssetPath("/routes/siliguri-kurseong-darjeeling/meta/hero.webp"),
    assetFolder: "routes/siliguri-kurseong-darjeeling",
    totalFrames: 247,
    agencies: []
  }
];
