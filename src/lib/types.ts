export interface Agency {
    id: string;
    name: string;
    address?: string;
    email?: string;
    website?: string;
    phone?: string;
    contact_no?: string;
    whatsapp?: string;
    isVerified?: boolean;
}

export interface RouteInfo {
    id: string;
    title: string;
    subtitle: string;
    slug: string;
    featuredAgencyId?: string;
    agencies: Agency[];
    sponsorCount?: number;
    distanceKm?: number;
    durationHours?: number;
    assetFolder?: string;
    totalFrames?: number;
    desktopAssetFolder?: string;
    desktopTotalFrames?: number;
    heroImage?: string;
}
