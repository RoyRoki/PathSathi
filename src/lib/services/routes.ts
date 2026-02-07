"use client";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { Route, Agency } from "@/lib/types/domain";
import { firestoreToRoute, firestoreToAgency } from "@/lib/types/converters";

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
                const route = firestoreToRoute(docItem.id, docItem.data());

                // Get live agency count (includes trial expiry check)
                const liveCount = await getRouteAgencyCount(docItem.id);

                return {
                    ...route,
                    sponsorCount: liveCount, // Use live count instead of stored value
                };
            })
        );

        // Sort client-side by created_at (newest first)
        return routesWithCounts.sort((a, b) => {
            const aTime = a.createdAt?.getTime() ?? 0;
            const bTime = b.createdAt?.getTime() ?? 0;
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
            return firestoreToRoute(docItem.id, docItem.data());
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

        return firestoreToRoute(snapshot.id, snapshot.data());
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

                const agency = firestoreToAgency(agencyId, agencySnapshot.data());

                // Only return verified agencies with valid trial
                if (!agency.isVerified) return null;

                const trialExpiry = agency.trialExpiry;
                if (trialExpiry && trialExpiry.getTime() < Date.now()) return null;

                return agency;
            })
        );

        return agencies.filter((agency): agency is Agency => agency !== null);
    } catch (error) {
        console.error("Error fetching route agencies:", error);
        return [];
    }
}
