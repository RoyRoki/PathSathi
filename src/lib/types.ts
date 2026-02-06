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
    logo_url?: string;
    status?: string;
    trialStart?: string;
    trialExpiry?: string;
}

export interface Route {
    id: string;
    title: string;
    subtitle: string;
    path_slug: string;
    status: 'active' | 'inactive';
    sponsor_count: number;
    distance_km?: number;
    duration_hours?: number;
    hero_image?: string;
    asset_folder?: string;
    total_frames?: number;
    desktop_asset_folder?: string;
    desktop_total_frames?: number;
    featured_agency_uid?: string;
    created_at?: Date;
    updated_at?: Date;
}

// Legacy interface for backward compatibility with existing components
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
