import { Timestamp } from "firebase/firestore";

/**
 * Raw Firestore document types with Timestamp fields
 * These represent the exact structure stored in Firestore
 */

export interface FirestoreAgency {
    uid: string;
    name: string;
    email: string;
    contact_no: string;
    address?: string;
    website?: string;
    whatsapp?: string;
    logo_url?: string;
    is_verified: boolean;
    status: "pending" | "verified" | "denied" | "active";
    role?: string;
    trial_start?: Timestamp;
    trial_expiry?: Timestamp;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

export interface FirestoreRoute {
    title: string;
    subtitle: string;
    path_slug: string;
    status: "active" | "inactive";
    sponsor_count: number;
    distance_km?: number;
    duration_hours?: number;
    hero_image?: string;
    asset_folder?: string;
    total_frames?: number;
    desktop_asset_folder?: string;
    desktop_total_frames?: number;
    featured_agency_uid?: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

export interface FirestoreRoutePurchase {
    route_id: string;
    agency_uid: string;
    status: "pending" | "approved" | "denied";
    created_at?: Timestamp;
    approved_at?: Timestamp;
    denied_at?: Timestamp;
}
