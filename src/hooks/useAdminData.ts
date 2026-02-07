import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    increment,
    deleteDoc
} from "firebase/firestore";
import { getFirestoreDb, getFirebaseAuth } from "@/lib/firebase";
import { Agency, Route, RoutePurchaseRequest } from "@/lib/types";

export const useAdminData = (isAdmin: boolean) => {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [requests, setRequests] = useState<RoutePurchaseRequest[]>([]);
    const [allRoutes, setAllRoutes] = useState<Route[]>([]);
    const [availableFolders, setAvailableFolders] = useState<string[]>([]);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

    const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(null), 5000);
    };

    const loadFolders = async () => {
        try {
            const res = await fetch('/api/route-folders');
            const data = await res.json();
            if (data.folders) setAvailableFolders(data.folders);
        } catch (e) {
            console.error("Failed to load folders", e);
        }
    };

    const loadPending = async () => {
        const firestore = getFirestoreDb();
        if (!firestore) return;

        const agencySnapshot = await getDocs(
            query(collection(firestore, "agencies"), where("is_verified", "==", false))
        );
        setAgencies(agencySnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as Agency)));

        const requestSnapshot = await getDocs(
            query(collection(firestore, "routePurchases"), where("status", "==", "pending"))
        );
        setRequests(requestSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as RoutePurchaseRequest)));
    };

    const loadAllRoutes = async () => {
        const firestore = getFirestoreDb();
        if (!firestore) return;

        const routesSnapshot = await getDocs(collection(firestore, "routes"));
        setAllRoutes(routesSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as Route)));
    };

    const loadAllData = async () => {
        await Promise.all([loadPending(), loadAllRoutes(), loadFolders()]);
    };

    useEffect(() => {
        if (isAdmin) {
            loadAllData();
        }
    }, [isAdmin]);

    const approveAgency = async (agencyId: string, trialDays = 7) => {
        setLoadingStates(prev => ({ ...prev, [`approve-agency-${agencyId}`]: true }));
        try {
            const firestore = getFirestoreDb();
            if (!firestore) return;

            const now = new Date();
            const expiry = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

            await updateDoc(doc(firestore, "agencies", agencyId), {
                is_verified: true,
                status: "verified",
                trial_start: Timestamp.fromDate(new Date()),
                trial_expiry: Timestamp.fromDate(expiry)
            });

            await loadPending();
            showMessage("Agency approved successfully!", "success");
        } catch (error) {
            showMessage("Failed to approve agency.", "error");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`approve-agency-${agencyId}`]: false }));
        }
    };

    const denyAgency = async (agencyId: string) => {
        setLoadingStates(prev => ({ ...prev, [`deny-agency-${agencyId}`]: true }));
        try {
            const firestore = getFirestoreDb();
            if (!firestore) return;

            await updateDoc(doc(firestore, "agencies", agencyId), {
                status: "denied"
            });

            await loadPending();
            showMessage("Agency denied.", "info");
        } catch (error) {
            showMessage("Failed to deny agency.", "error");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`deny-agency-${agencyId}`]: false }));
        }
    };

    const approveRequest = async (requestId: string, routeId: string, agencyUid: string) => {
        setLoadingStates(prev => ({ ...prev, [`approve-request-${requestId}`]: true }));
        try {
            const firestore = getFirestoreDb();
            if (!firestore) return;

            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            await updateDoc(doc(firestore, "routePurchases", requestId), {
                status: "approved",
                approved_at: serverTimestamp()
            });

            await updateDoc(doc(firestore, "agencies", agencyUid), {
                trial_start: Timestamp.fromDate(now),
                trial_expiry: Timestamp.fromDate(sevenDaysFromNow),
                updated_at: serverTimestamp()
            });

            const routeAccessRef = doc(firestore, "agencies", agencyUid, "routes", routeId);
            await setDoc(routeAccessRef, {
                route_id: routeId,
                granted_at: serverTimestamp(),
                trial_start: Timestamp.fromDate(now),
                trial_expiry: Timestamp.fromDate(sevenDaysFromNow)
            });

            await runTransaction(firestore, async (transaction) => {
                const routeRef = doc(firestore, "routes", routeId);
                const routeSnap = await transaction.get(routeRef);
                const currentFeatured = routeSnap.data()?.featured_agency_uid;
                transaction.update(routeRef, {
                    sponsor_count: increment(1),
                    featured_agency_uid: currentFeatured ?? agencyUid
                });
            });

            await loadAllData();
            showMessage("Request approved successfully!", "success");
        } catch (error) {
            showMessage("Failed to approve request.", "error");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`approve-request-${requestId}`]: false }));
        }
    };

    const denyRequest = async (requestId: string) => {
        setLoadingStates(prev => ({ ...prev, [`deny-request-${requestId}`]: true }));
        try {
            const firestore = getFirestoreDb();
            if (!firestore) return;

            await updateDoc(doc(firestore, "routePurchases", requestId), {
                status: "denied",
                denied_at: serverTimestamp()
            });

            await loadPending();
            showMessage("Request denied.", "info");
        } catch (error) {
            showMessage("Failed to deny request.", "error");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`deny-request-${requestId}`]: false }));
        }
    };

    const deleteRoute = async (routeId: string) => {
        if (!window.confirm("Are you sure you want to delete this route? This cannot be undone.")) return;
        setLoadingStates(prev => ({ ...prev, [`delete-route-${routeId}`]: true }));
        try {
            const firestore = getFirestoreDb();
            if (!firestore) return;
            await deleteDoc(doc(firestore, "routes", routeId));
            await loadAllRoutes();
            showMessage("Route deleted successfully.", "success");
        } catch (error) {
            showMessage("Failed to delete route.", "error");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`delete-route-${routeId}`]: false }));
        }
    };

    const toggleRouteStatus = async (routeId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        setLoadingStates(prev => ({ ...prev, [`toggle-route-${routeId}`]: true }));
        try {
            const firestore = getFirestoreDb();
            if (!firestore) return;

            await updateDoc(doc(firestore, "routes", routeId), {
                status: newStatus,
                updated_at: serverTimestamp()
            });

            await loadAllRoutes();
            showMessage(`Route ${newStatus === "active" ? "activated" : "deactivated"} successfully!`, "success");
        } catch (error: any) {
            console.error("Toggle route status error:", error);
            showMessage(`Failed to update route status: ${error.code || error.message}`, "error");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`toggle-route-${routeId}`]: false }));
        }
    };

    const seedInitialData = async () => {
        setLoadingStates(prev => ({ ...prev, 'seed': true }));
        try {
            const firestore = getFirestoreDb();
            if (!firestore) return;

            await setDoc(doc(firestore, "routes", "siliguri-kurseong-darjeeling"), {
                title: "Siliguri to Darjeeling",
                subtitle: "Via Kurseong",
                path_slug: "siliguri-kurseong-darjeeling",
                asset_folder: "siliguri-kurseong-darjeeling",
                total_frames: 4000,
                desktop_total_frames: 4000,
                distance_km: 65,
                duration_hours: 3,
                hero_image: "/images/darjeeling_hero_bg_1770289408859.png",
                status: "active",
                sponsor_count: 0,
                created_at: serverTimestamp()
            });

            await setDoc(doc(firestore, "routes", "kolkata-sundarbans"), {
                title: "Kolkata to Sundarbans",
                subtitle: "River Delta Journey",
                path_slug: "kolkata-sundarbans",
                asset_folder: "kolkata-sundarbans",
                total_frames: 1000,
                desktop_total_frames: 1000,
                distance_km: 100,
                duration_hours: 5,
                hero_image: "/images/sundarbans-hero.jpg",
                status: "inactive",
                sponsor_count: 0,
                created_at: serverTimestamp()
            });

            const auth = getFirebaseAuth();
            if (auth && auth.currentUser) {
                await setDoc(doc(firestore, "agencies", auth.currentUser.uid), {
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    name: "Admin User",
                    is_verified: true,
                    role: "admin",
                    status: "active",
                    created_at: serverTimestamp()
                }, { merge: true });
            }

            await loadAllRoutes();
            showMessage("Database seeded successfully!", "success");
        } catch (error) {
            console.error(error);
            showMessage("Failed to seed data.", "error");
        } finally {
            setLoadingStates(prev => ({ ...prev, 'seed': false }));
        }
    };

    return {
        agencies,
        requests,
        allRoutes,
        availableFolders,
        loadingStates,
        message,
        messageType,
        showMessage,
        approveAgency,
        denyAgency,
        approveRequest,
        denyRequest,
        deleteRoute,
        toggleRouteStatus,
        seedInitialData,
        loadAllRoutes,
    };
};
