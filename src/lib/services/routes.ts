"use client";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { Route, Agency } from "@/lib/types";

/**
 * Fetch all active routes from Firestore with live agency counts
 */
export async function getActiveRoutes(): Promise<Route[]> {
    const firestore = getFirestoreDb();
    if (!firestore) {
        console.warn("Firebase not configured, returning empty routes");
        return [];
    }

    try {
        // Simple query without orderBy - avoids composite index requirement
        const routesQuery = query(
            collection(firestore, "routes"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(routesQuery);

        // Build routes with live sponsor counts
        const routesWithCounts = await Promise.all(
            snapshot.docs.map(async (docItem) => {
                const data = docItem.data();

                // Get live agency count (includes trial expiry check)
                const liveCount = await getRouteAgencyCount(docItem.id);

                return {
                    id: docItem.id,
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    path_slug: data.path_slug || docItem.id,
                    status: data.status || "active",
                    sponsor_count: liveCount, // Use live count instead of stored value
                    distance_km: data.distance_km,
                    duration_hours: data.duration_hours,
                    hero_image: data.hero_image,
                    asset_folder: data.asset_folder,
                    total_frames: data.total_frames,
                    desktop_asset_folder: data.desktop_asset_folder,
                    desktop_total_frames: data.desktop_total_frames,
                    featured_agency_uid: data.featured_agency_uid,
                    created_at: data.created_at?.toDate?.(),
                    updated_at: data.updated_at?.toDate?.()
                } as Route;
            })
        );

        // Sort client-side by created_at (newest first)
        return routesWithCounts.sort((a, b) => {
            const aTime = a.created_at?.getTime() || 0;
            const bTime = b.created_at?.getTime() || 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error("Error fetching active routes:", error);
        return [];
    }
}

/**
 * Fetch all routes (for admin use)
 */
export async function getAllRoutes(): Promise<Route[]> {
    const firestore = getFirestoreDb();
    if (!firestore) {
        return [];
    }

    try {
        const snapshot = await getDocs(collection(firestore, "routes"));

        return snapshot.docs.map((docItem) => {
            const data = docItem.data();
            return {
                id: docItem.id,
                title: data.title || "",
                subtitle: data.subtitle || "",
                path_slug: data.path_slug || docItem.id,
                status: data.status || "inactive",
                sponsor_count: data.sponsor_count || 0,
                distance_km: data.distance_km,
                duration_hours: data.duration_hours,
                hero_image: data.hero_image,
                asset_folder: data.asset_folder,
                total_frames: data.total_frames,
                desktop_asset_folder: data.desktop_asset_folder,
                desktop_total_frames: data.desktop_total_frames,
                featured_agency_uid: data.featured_agency_uid,
                created_at: data.created_at?.toDate?.(),
                updated_at: data.updated_at?.toDate?.()
            } as Route;
        });
    } catch (error) {
        console.error("Error fetching all routes:", error);
        return [];
    }
}

/**
 * Fetch a single route by slug
 */
export async function getRouteBySlug(slug: string): Promise<Route | null> {
    const firestore = getFirestoreDb();
    if (!firestore) {
        return null;
    }

    try {
        const routeRef = doc(firestore, "routes", slug);
        const snapshot = await getDoc(routeRef);

        if (!snapshot.exists()) {
            return null;
        }

        const data = snapshot.data();
        return {
            id: snapshot.id,
            title: data.title || "",
            subtitle: data.subtitle || "",
            path_slug: data.path_slug || snapshot.id,
            status: data.status || "inactive",
            sponsor_count: data.sponsor_count || 0,
            distance_km: data.distance_km,
            duration_hours: data.duration_hours,
            hero_image: data.hero_image,
            asset_folder: data.asset_folder,
            total_frames: data.total_frames,
            desktop_asset_folder: data.desktop_asset_folder,
            desktop_total_frames: data.desktop_total_frames,
            featured_agency_uid: data.featured_agency_uid,
            created_at: data.created_at?.toDate?.(),
            updated_at: data.updated_at?.toDate?.()
        } as Route;
    } catch (error) {
        console.error("Error fetching route by slug:", error);
        return null;
    }
}

/**
 * Get count of approved agencies for a route (with trial expiry check)
 */
export async function getRouteAgencyCount(routeId: string): Promise<number> {
    const firestore = getFirestoreDb();
    if (!firestore) {
        return 0;
    }

    try {
        const purchasesQuery = query(
            collection(firestore, "routePurchases"),
            where("route_id", "==", routeId),
            where("status", "==", "approved")
        );

        const snapshot = await getDocs(purchasesQuery);

        if (snapshot.empty) return 0;

        // Get unique agency UIDs and check their trial expiry
        const agencyIds = Array.from(
            new Set(snapshot.docs.map((d) => d.data().agency_uid as string))
        );

        let validCount = 0;
        const now = Date.now();

        for (const agencyId of agencyIds) {
            const agencyRef = doc(firestore, "agencies", agencyId);
            const agencySnapshot = await getDoc(agencyRef);

            if (!agencySnapshot.exists()) continue;

            const agencyData = agencySnapshot.data();
            if (!agencyData.is_verified) continue;

            // Check trial expiry
            const trialExpiry = agencyData.trial_expiry?.toDate?.();
            if (trialExpiry && trialExpiry.getTime() < now) continue;

            validCount++;
        }

        return validCount;
    } catch (error) {
        console.error("Error getting route agency count:", error);
        return 0;
    }
}

/**
 * Get list of verified agencies for a route
 */
export async function getRouteAgencies(routeId: string): Promise<Agency[]> {
    const firestore = getFirestoreDb();
    if (!firestore) {
        return [];
    }

    try {
        // Get approved purchases for this route
        const purchasesQuery = query(
            collection(firestore, "routePurchases"),
            where("route_id", "==", routeId),
            where("status", "==", "approved")
        );

        const purchaseSnapshot = await getDocs(purchasesQuery);

        if (purchaseSnapshot.empty) {
            return [];
        }

        // Get unique agency UIDs
        const agencyIds = Array.from(
            new Set(
                purchaseSnapshot.docs.map((docItem) => docItem.data().agency_uid as string)
            )
        );

        // Fetch agency details
        const agencies = await Promise.all(
            agencyIds.map(async (agencyId) => {
                const agencyRef = doc(firestore, "agencies", agencyId);
                const agencySnapshot = await getDoc(agencyRef);

                if (!agencySnapshot.exists()) return null;

                const agencyData = agencySnapshot.data();

                // Only return verified agencies with valid trial
                if (!agencyData.is_verified) return null;

                const trialExpiry = agencyData.trial_expiry?.toDate?.();
                if (trialExpiry && trialExpiry.getTime() < Date.now()) return null;

                return {
                    id: agencyId,
                    name: agencyData.name,
                    phone: agencyData.contact_no,
                    contact_no: agencyData.contact_no,
                    email: agencyData.email,
                    website: agencyData.website,
                    address: agencyData.address,
                    isVerified: agencyData.is_verified,
                    whatsapp: agencyData.whatsapp,
                    logo_url: agencyData.logo_url,
                    status: agencyData.status,
                    trialStart: agencyData.trial_start?.toDate?.()?.toISOString(),
                    trialExpiry: agencyData.trial_expiry?.toDate?.()?.toISOString()
                } as Agency;
            })
        );

        return agencies.filter(Boolean) as Agency[];
    } catch (error) {
        console.error("Error fetching route agencies:", error);
        return [];
    }
}
