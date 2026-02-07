/**
 * Application domain types with Date objects for business logic
 * These are used throughout the application for type safety
 */

export interface Agency {
    id: string;
    name: string;
    email: string;
    contactNo: string;
    address?: string;
    website?: string;
    whatsapp?: string;
    logoUrl?: string;
    isVerified: boolean;
    status: "pending" | "verified" | "denied" | "active";
    role?: string;
    trialStart?: Date;
    trialExpiry?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Route {
    id: string;
    title: string;
    subtitle: string;
    pathSlug: string;
    status: "active" | "inactive";
    sponsorCount: number;
    distanceKm?: number;
    durationHours?: number;
    heroImage?: string;
    assetFolder?: string;
    totalFrames?: number;
    desktopAssetFolder?: string;
    desktopTotalFrames?: number;
    featuredAgencyUid?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RoutePurchaseRequest {
    id: string;
    routeId: string;
    agencyUid: string;
    status: "pending" | "approved" | "denied";
    createdAt?: Date;
    approvedAt?: Date;
    deniedAt?: Date;
}

export interface RouteFormData {
    title: string;
    subtitle: string;
    pathSlug: string;
    assetFolder: string;
    totalFrames: number;
    distanceKm: number;
    durationHours: number;
    heroImage: string;
    status: "active" | "inactive";
}

export interface PurchasePayload {
    routeId: string;
    agencyUid: string;
    agencyName: string;
    agencyEmail: string;
    contactNo: string;
    status: "pending";
    createdAt: Date;
}
