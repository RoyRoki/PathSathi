import { DocumentData } from "firebase/firestore";
import type { FirestoreAgency, FirestoreRoute, FirestoreRoutePurchase } from "./firestore";
import type { Agency, Route, RoutePurchaseRequest } from "./domain";

/**
 * Type-safe converters between Firestore and domain types
 */

export function firestoreToAgency(id: string, data: DocumentData): Agency {
    const fsData = data as FirestoreAgency;

    return {
        id,
        name: fsData.name,
        email: fsData.email,
        contactNo: fsData.contact_no,
        address: fsData.address,
        website: fsData.website,
        whatsapp: fsData.whatsapp,
        logoUrl: fsData.logo_url,
        isVerified: fsData.is_verified,
        status: fsData.status,
        role: fsData.role,
        trialStart: fsData.trial_start?.toDate(),
        trialExpiry: fsData.trial_expiry?.toDate(),
        createdAt: fsData.created_at?.toDate(),
        updatedAt: fsData.updated_at?.toDate(),
    };
}

export function firestoreToRoute(id: string, data: DocumentData): Route {
    const fsData = data as FirestoreRoute;

    return {
        id,
        title: fsData.title,
        subtitle: fsData.subtitle,
        pathSlug: fsData.path_slug?.toLowerCase(),
        status: fsData.status,
        sponsorCount: fsData.sponsor_count,
        distanceKm: fsData.distance_km,
        durationHours: fsData.duration_hours,
        heroImage: fsData.hero_image?.toLowerCase(),
        assetFolder: fsData.asset_folder?.toLowerCase(),
        totalFrames: fsData.total_frames,
        desktopAssetFolder: fsData.desktop_asset_folder?.toLowerCase(),
        desktopTotalFrames: fsData.desktop_total_frames,
        featuredAgencyUid: fsData.featured_agency_uid,
        createdAt: fsData.created_at?.toDate(),
        updatedAt: fsData.updated_at?.toDate(),
    };
}

export function firestoreToRoutePurchase(id: string, data: DocumentData): RoutePurchaseRequest {
    const fsData = data as FirestoreRoutePurchase;

    return {
        id,
        routeId: fsData.route_id,
        agencyUid: fsData.agency_uid,
        status: fsData.status,
        createdAt: fsData.created_at?.toDate(),
        approvedAt: fsData.approved_at?.toDate(),
        deniedAt: fsData.denied_at?.toDate(),
    };
}

/**
 * Helper to safely convert Timestamp to Date with null checks
 */
export function timestampToDate(timestamp: { toDate?: () => Date } | undefined): Date | undefined {
    return timestamp?.toDate?.();
}
