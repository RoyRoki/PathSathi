/**
 * Legacy type definitions - Re-exported from new type system
 * 
 * This file maintains backward compatibility while the codebase
 * is being migrated to use the new domain types.
 * 
 * @deprecated Import from @/lib/types/domain instead
 */

import type { Agency } from "./types/domain";
export type {
    Agency,
    Route,
    RoutePurchaseRequest,
    RouteFormData,
    PurchasePayload
} from "./types/domain";

export type {
    FirestoreAgency,
    FirestoreRoute,
    FirestoreRoutePurchase
} from "./types/firestore";

export type {
    firestoreToAgency,
    firestoreToRoute,
    firestoreToRoutePurchase,
    timestampToDate
} from "./types/converters";

// Legacy interface for backward compatibility
// TODO: Remove this once all components are updated
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
