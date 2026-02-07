"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  increment,
  deleteDoc,
  deleteField
} from "firebase/firestore";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import { getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { AgenciesTab } from "@/components/admin/AgenciesTab";
import {
  MapPin,
  ShieldAlert,
  Users,
  Map as MapIcon,
  Bell,
  Settings,
  LogOut,
  XCircle,
  Plus,
  LayoutDashboard,
  Activity,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  Eye
} from "lucide-react";


type Tab = "overview" | "agencies" | "requests" | "routes";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [allAgencies, setAllAgencies] = useState<any[]>([]);
  const [agencyRoutes, setAgencyRoutes] = useState<Record<string, any[]>>({});
  const [requests, setRequests] = useState<any[]>([]);
  const [agencySearchQuery, setAgencySearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<any | null>(null);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const [routeForm, setRouteForm] = useState({
    title: "",
    subtitle: "",
    path_slug: "",
    asset_folder: "dummy",
    total_frames: 1,
    distance_km: 0,
    duration_hours: 0,
    hero_image: "",
    status: "inactive" as "active" | "inactive"
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const firestore = getFirestoreDb();

    if (!auth || !firestore) {
      setAuthChecked(true);
      setIsAdmin(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthChecked(true);
        setIsAdmin(false);
        return;
      }
      const tokenResult = await getIdTokenResult(user);
      const adminClaim = Boolean(tokenResult.claims.admin) || user.email === "admin@gmail.com";
      setIsAdmin(adminClaim);
      setAuthChecked(true);
      if (adminClaim) {
        try {
          await loadAllData();
        } catch (error: any) {
          console.error("Data loading failed:", error);
          if (error.code === 'permission-denied') {
            showMessage("Permission denied. Ensure your account is an admin and rules are deployed.", "error");
          } else {
            showMessage(`Failed to load data: ${error.message}`, "error");
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadPending(), loadAllAgencies(), loadAllRoutes()]);
  };

  const loadPending = async () => {
    const firestore = getFirestoreDb();
    if (!firestore) return;

    const agencySnapshot = await getDocs(
      query(collection(firestore, "agencies"), where("is_verified", "==", false))
    );
    setAgencies(agencySnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));

    const requestSnapshot = await getDocs(
      query(collection(firestore, "routePurchases"), where("status", "==", "pending"))
    );
    setRequests(requestSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
  };

  const loadAllRoutes = async () => {
    const firestore = getFirestoreDb();
    if (!firestore) return;

    const routesSnapshot = await getDocs(collection(firestore, "routes"));
    setAllRoutes(routesSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
  };

  const loadAllAgencies = async () => {
    const firestore = getFirestoreDb();
    if (!firestore) return;

    try {
      const agenciesSnapshot = await getDocs(collection(firestore, "agencies"));
      const agenciesData = agenciesSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setAllAgencies(agenciesData);

      // Load routes for each agency
      const routesMap: Record<string, any[]> = {};
      await Promise.all(
        agenciesData.map(async (agency) => {
          const routes = await loadAgencyRoutes(agency);
          routesMap[agency.id] = routes;
        })
      );
      setAgencyRoutes(routesMap);
    } catch (error: any) {
      console.error("Failed to load all agencies:", error);
      if (error.code === 'permission-denied') {
        // This confirms the user is logged in but rules rejected the read
        // Likely missing admin claim or rules not deployed
        throw error; // Re-throw to be caught by the main loader
      }
    }
  };

  const loadAgencyRoutes = async (agency: any): Promise<any[]> => {
    const firestore = getFirestoreDb();
    if (!firestore) return [];

    try {
      // 1. Fetch from subcollection (Access Control List - existing logic)
      const routesSnapshot = await getDocs(
        collection(firestore, "agencies", agency.id, "routes")
      );

      const aclRoutes = routesSnapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          ...data,
          route_id: data.route_id || docItem.id, // Ensure route_id is present
          _source: 'acl'
        };
      });

      // 2. Fetch from routePurchases (Billing/Ownership source of truth)
      // This ensures we see routes even if the ACL write failed previously
      const purchasesSnapshot = await getDocs(
        query(
          collection(firestore, "routePurchases"),
          where("agency_uid", "==", agency.id),
          where("status", "==", "approved")
        )
      );

      const purchasedRoutes = purchasesSnapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: data.route_id, // Normalize ID to route_id
          route_id: data.route_id,
          trial_expiry: null, // Purchase record might not have expiry, usually in ACL
          trial_start: null,
          ...data,
          _source: 'purchase'
        };
      });

      // 3. Merge: Prefer ACL data (has expiry) over Purchase data, but include Purchase if missing in ACL
      const routeMap = new Map();

      // Add purchases first
      purchasedRoutes.forEach(r => routeMap.set(r.route_id, r));

      // Overwrite with ACL data (which is more specific for access details)
      aclRoutes.forEach((r: any) => {
        // ACL docs usually use route_id as document ID, checking both just in case
        const key = r.route_id || r.id;
        routeMap.set(key, { ...routeMap.get(key), ...r });
      });

      const combinedRoutes = Array.from(routeMap.values());

      console.log(`[DEBUG] Agency ${agency.email}: ACL Docs: ${aclRoutes.length}, Purchases: ${purchasedRoutes.length} -> Combined: ${combinedRoutes.length}`);

      return combinedRoutes;

    } catch (error: any) {
      console.error(`Failed to load routes for agency ${agency.email} (${agency.id}):`, error);
      if (error.code === 'permission-denied') {
        showMessage(`Permission denied loading routes for ${agency.email}. Check Rules.`, "error");
      }
      return [];
    }
  };

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const login = async () => {
    setLoadingStates(prev => ({ ...prev, 'login': true }));
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Firebase is not configured.");
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      showMessage("Admin login failed. Please check your credentials.", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, 'login': false }));
    }
  };


  const approveRequest = async (requestId: string, routeId: string, agencyUid: string) => {
    setLoadingStates(prev => ({ ...prev, [`approve-request-${requestId}`]: true }));
    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      // Set 7-day trial period from now
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Update the purchase request status
      await updateDoc(doc(firestore, "routePurchases", requestId), {
        status: "approved",
        approved_at: serverTimestamp()
      });

      // Update the agency with trial period
      await updateDoc(doc(firestore, "agencies", agencyUid), {
        trial_start: Timestamp.fromDate(now),
        trial_expiry: Timestamp.fromDate(sevenDaysFromNow),
        updated_at: serverTimestamp()
      });

      // Add route access to agency
      const routeAccessRef = doc(firestore, "agencies", agencyUid, "routes", routeId);
      await setDoc(routeAccessRef, {
        route_id: routeId,
        granted_at: serverTimestamp(),
        trial_start: Timestamp.fromDate(now),
        trial_expiry: Timestamp.fromDate(sevenDaysFromNow)
      });

      // Update route sponsor count and featured agency
      await runTransaction(firestore, async (transaction) => {
        const routeRef = doc(firestore, "routes", routeId);
        const routeSnap = await transaction.get(routeRef);

        if (!routeSnap.exists()) {
          console.error(`Route ${routeId} does not exist`);
          // We don't throw here to avoid failing the whole operation if just the route stats update fails
          // But for strict data integrity we might want to. 
          // For now, let's just return to allow the approval to proceed partially or log it.
          // Actually, let's treat it as non-fatal or create the route if needed? 
          // Better: throw a specific error to catch below.
          throw new Error(`Route document '${routeId}' not found. Cannot update stats.`);
        }

        const currentFeatured = routeSnap.data()?.featured_agency_uid;
        transaction.update(routeRef, {
          sponsor_count: increment(1),
          featured_agency_uid: currentFeatured ?? agencyUid
        });
      });

      await loadAllData();
      showMessage("Request approved successfully!", "success");
    } catch (error: any) {
      console.error("Failed to approve request", error);
      showMessage(`Approval failed: ${error.message}`, "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, [`approve-request-${requestId}`]: false }));
    }
  };

  const revokeRoute = async (agencyUid: string, routeId: string) => {
    const loadingKey = `revoke-${agencyUid}-${routeId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      // 1. Delete the route access document
      await deleteDoc(doc(firestore, "agencies", agencyUid, "routes", routeId));

      // 2. Find and delete the purchase request to allow re-requesting
      // The ID is deterministic: `agencyUid_routeId`
      const purchaseId = `${agencyUid}_${routeId}`;
      await deleteDoc(doc(firestore, "routePurchases", purchaseId));

      // 3. Decrement sponsor count
      await runTransaction(firestore, async (transaction) => {
        const routeRef = doc(firestore, "routes", routeId);
        const routeSnap = await transaction.get(routeRef);
        if (routeSnap.exists()) {
          transaction.update(routeRef, {
            sponsor_count: increment(-1)
          });
        }
      });

      // 4. Clear trial info from agency
      await updateDoc(doc(firestore, "agencies", agencyUid), {
        trial_start: deleteField(),
        trial_expiry: deleteField(),
        updated_at: serverTimestamp()
      });

      await loadAllData();
      showMessage("Route access revoked & trial reset successfully.", "success");
    } catch (error: any) {
      console.error("Failed to revoke access:", error);
      showMessage(`Revocation failed: ${error.message}`, "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
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

  const toggleAgencyStatus = async (agencyId: string, currentStatus: string) => {
    const loadingKey = `toggle-agency-${agencyId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const updates: any = {
        status: newStatus,
        updated_at: serverTimestamp()
      };

      // If we are enabling (activating) the agency, also mark them as verified
      if (newStatus === "active") {
        updates.is_verified = true;
      }

      await updateDoc(doc(firestore, "agencies", agencyId), updates);

      await loadAllAgencies();
      showMessage(`Agency ${newStatus === "active" ? "activated & verified" : "deactivated"} successfully!`, "success");
    } catch (error: any) {
      console.error("Toggle agency status error:", error);
      showMessage(`Failed to update status: ${error.code || error.message}`, "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
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

  const openEditModal = (route: any) => {
    setEditingRouteId(route.id);
    setRouteForm({
      title: route.title,
      subtitle: route.subtitle || "",
      path_slug: route.path_slug,
      asset_folder: route.asset_folder || "dummy",
      total_frames: route.total_frames || 1,
      distance_km: route.distance_km || 0,
      duration_hours: route.duration_hours || 0,
      hero_image: route.hero_image || "",
      status: route.status || "inactive"
    });
    setShowRouteModal(true);
  };

  const handleRouteSubmit = async () => {
    if (editingRouteId) {
      await updateRoute();
    } else {
      await createRoute();
    }
  };

  const updateRoute = async () => {
    if (!editingRouteId) return;
    setLoadingStates(prev => ({ ...prev, 'route-submit': true }));
    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      const routeRef = doc(firestore, "routes", editingRouteId);

      await updateDoc(routeRef, {
        title: routeForm.title,
        subtitle: routeForm.subtitle,
        asset_folder: routeForm.asset_folder,
        total_frames: routeForm.total_frames,
        distance_km: routeForm.distance_km,
        duration_hours: routeForm.duration_hours,
        hero_image: routeForm.hero_image,
        updated_at: serverTimestamp()
      });

      setShowRouteModal(false);
      setEditingRouteId(null);
      await loadAllRoutes();
      showMessage("Route updated successfully!", "success");
    } catch (error) {
      showMessage("Failed to update route.", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, 'route-submit': false }));
    }
  };

  const createRoute = async () => {
    if (!routeForm.path_slug || !routeForm.title) {
      showMessage("Please fill in route title and slug.", "error");
      return;
    }

    setLoadingStates(prev => ({ ...prev, 'route-submit': true }));
    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      await setDoc(doc(firestore, "routes", routeForm.path_slug), {
        title: routeForm.title,
        subtitle: routeForm.subtitle,
        path_slug: routeForm.path_slug,
        asset_folder: routeForm.asset_folder,
        total_frames: routeForm.total_frames,
        distance_km: routeForm.distance_km,
        duration_hours: routeForm.duration_hours,
        hero_image: routeForm.hero_image,
        status: routeForm.status,
        sponsor_count: 0,
        created_at: serverTimestamp()
      });

      setRouteForm({
        title: "",
        subtitle: "",
        path_slug: "",
        asset_folder: "dummy",
        total_frames: 1,
        distance_km: 0,
        duration_hours: 0,
        hero_image: "",
        status: "inactive"
      });

      setShowRouteModal(false);
      setEditingRouteId(null);
      await loadAllRoutes();
      showMessage("Route created successfully!", "success");
    } catch (error) {
      showMessage("Failed to create route.", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, 'route-submit': false }));
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

      // Create Siliguri-Kurseong-Darjeeling route
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

      // Create Kolkata-Sundarbans route (Inactive)
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

      // Create Admin User entry
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

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary opacity-20" style={{ animationDuration: '2s' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-foreground mb-1">PathSathi Console</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Establishing secure connection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
        </div>

        {/* Floating Orbs */}
        <div className="fixed top-1/4 -left-48 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="fixed bottom-1/4 -right-48 w-96 h-96 bg-violet-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />

        {/* Subtle Grid Pattern */}
        <div className="fixed inset-0 -z-5 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        {/* Animated Stars/Particles */}
        <div className="fixed inset-0 -z-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Glassmorphic Card */}
          <div className="relative">
            {/* Glow Effect Behind Card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />

            <div className="relative bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              {/* Inner Glow */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              {/* Floating Accent Orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />

              <div className="relative">
                {/* Icon Section */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl blur-xl opacity-50" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      <ShieldAlert className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-blue-100 to-violet-100 bg-clip-text text-transparent tracking-tight">
                    TERMINAL ALPHA
                  </h1>
                  <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-[0.3em]">
                    Authorized Access Only
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200/80 ml-2">
                      Access Identifier
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="relative h-14 bg-white/5 border-white/20 hover:border-white/30 focus:border-blue-400/50 rounded-2xl backdrop-blur-xl transition-all text-white placeholder:text-white/40 font-medium px-5 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20"
                        placeholder="admin@pathsathi.com"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200/80 ml-2">
                      Security Key
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="relative h-14 bg-white/5 border-white/20 hover:border-white/30 focus:border-violet-400/50 rounded-2xl backdrop-blur-xl transition-all text-white placeholder:text-white/40 font-medium px-5 focus:bg-white/10 focus:ring-2 focus:ring-violet-400/20"
                        placeholder="Enter secure passkey"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      size="lg"
                      className="relative w-full h-14 rounded-2xl text-base font-bold overflow-hidden group bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300"
                      onClick={login}
                      isLoading={loadingStates['login']}
                    >
                      <span className="relative z-10 text-white uppercase tracking-wider">
                        Establish Connection
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-white/10 text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/40">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span>Secure Node v4.2</span>
                    <span className="opacity-50">•</span>
                    <span>Encrypted Protocol</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "agencies" as Tab, label: "Agencies", icon: Users, badge: agencies.length > 0 ? agencies.length : undefined },
    { id: "requests" as Tab, label: "Requests", icon: Bell, badge: requests.length > 0 ? requests.length : undefined },
    { id: "routes" as Tab, label: "Route Library", icon: MapIcon }
  ];

  const mainStats = [
    { label: "Total Routes", value: allRoutes.length, icon: MapIcon, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending Verification", value: agencies.length, icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Open Requests", value: requests.length, icon: Bell, color: "text-secondary", bg: "bg-secondary/10" }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 opacity-40 dark:opacity-30 pointer-events-none">
        <Image
          src={getAssetPath("/images/dashboard-bg.png")}
          alt="Himalayan Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Texture Overlay */}
      <div className="fixed inset-0 -z-5 noise-bg opacity-30 pointer-events-none" />

      {/* Decorative Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-5" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] -z-5" />

      {/* Top Bar */}
      <header className="border-b border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">PathSathi <span className="text-primary font-black ml-1 uppercase text-xs tracking-[0.3em]">Console</span></h1>
                <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 mt-1 uppercase tracking-widest opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Administrative Node Active
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl w-11 h-11 hover:bg-destructive/10 hover:text-destructive transition-all"
              onClick={async () => {
                try {
                  const auth = getFirebaseAuth();
                  if (auth) {
                    await signOut(auth);
                    setIsAdmin(false);
                    setAuthChecked(true);
                    // We can also reload the page to be sure, but state update should be enough
                  }
                } catch (error) {
                  console.error("Logout failed", error);
                }
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Sidebar Navigation */}
          <aside className="space-y-2 sticky top-32 bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl">
            <div className="px-4 mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Management Console</h2>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold tracking-tight transition-all duration-300 relative overflow-hidden group ${activeTab === tab.id
                  ? "bg-primary text-white shadow-2xl translate-x-1 scale-105"
                  : "text-muted-foreground hover:bg-white/10 dark:hover:bg-white/5 hover:text-foreground hover:scale-102"
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "group-hover:scale-110 transition-transform duration-300"}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge && (
                  <span className={`flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-lg text-[10px] font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}>
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div layoutId="admin-nav-glow" className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
                )}
              </button>
            ))}
            <div className="pt-8 px-4 opacity-50">
              <div className="h-px bg-white/10 mb-8" />
              <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group">
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                Root Configuration
              </button>
            </div>
          </aside>

          {/* Content Panel */}
          <main>
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="grid md:grid-cols-3 gap-8">
                    {mainStats.map((stat, i) => (
                      <Card key={i} className="p-8 border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl shadow-3xl hover:translate-y-[-6px] hover:scale-105 transition-all duration-500 group cursor-pointer">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-7 h-7" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{stat.label}</p>
                        <p className="text-5xl font-black tracking-tight">{stat.value}</p>
                      </Card>
                    ))}
                  </div>

                  <Card className="rounded-[3rem] p-12 border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <h2 className="text-3xl font-black mb-8 tracking-tight font-sans">Executive Control</h2>
                    <div className="flex flex-wrap gap-6">
                      <Button size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl" onClick={() => setActiveTab("routes")}>
                        <Plus className="mr-2 w-5 h-5" />
                        Create New Route
                      </Button>
                      {agencies.length === 0 && (
                        <Button variant="outline" size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl border-white/20 hover:bg-white/10" onClick={seedInitialData} isLoading={loadingStates['seed']}>
                          <Activity className="mr-2 w-5 h-5" />
                          Seed Database
                        </Button>
                      )}
                      {agencies.length > 0 && (
                        <Button variant="secondary" size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl" onClick={() => setActiveTab("agencies")}>
                          Authorize {agencies.length} New {agencies.length === 1 ? 'Agency' : 'Agencies'}
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === "agencies" && (
                <motion.div
                  key="agencies"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AgenciesTab
                    allAgencies={allAgencies}
                    agencyRoutes={agencyRoutes}
                    agencySearchQuery={agencySearchQuery}
                    setAgencySearchQuery={setAgencySearchQuery}
                    toggleAgencyStatus={toggleAgencyStatus}
                    revokeRoute={revokeRoute}
                    loadingStates={loadingStates}
                    requests={requests}
                    approveRequest={approveRequest}
                  />
                </motion.div>
              )}

              {activeTab === "requests" && (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="rounded-[3rem] p-12 border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl shadow-3xl">
                    <h2 className="text-4xl font-black tracking-tight mb-12">Sponsorship Filings</h2>

                    {requests.length === 0 ? (
                      <div className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
                        <Bell className="w-16 h-16 mx-auto mb-6 text-primary/30" />
                        <p className="text-muted-foreground text-lg font-light italic">Signal silence. No active route requests found.</p>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {requests.map((request) => (
                          <div key={request.id} className="group overflow-hidden rounded-[2.5rem] p-8 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[10px] font-black px-4 py-1 rounded-full">Active Request</Badge>
                                <h3 className="font-black text-2xl tracking-tight mb-2 uppercase">Path: {request.route_id}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                  <Users className="w-4 h-4" />
                                  Agency ID: {request.agency_uid}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-4 justify-end">
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="rounded-2xl h-14 px-10 font-black shadow-none border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                                  onClick={async () => {
                                    let agency = agencies.find(a => a.id === request.agency_uid);
                                    if (!agency) {
                                      try {
                                        const firestore = getFirestoreDb();
                                        if (firestore) {
                                          const docSnap = await getDoc(doc(firestore, "agencies", request.agency_uid));
                                          if (docSnap.exists()) {
                                            // @ts-ignore
                                            agency = { id: docSnap.id, ...docSnap.data() };
                                          }
                                        }
                                      } catch (error) {
                                        console.error("Failed to fetch agency details", error);
                                      }
                                    }
                                    if (agency) setSelectedAgency(agency);
                                  }}
                                >
                                  <Eye className="mr-2 w-5 h-5" />
                                  View Agency
                                </Button>
                                <Button size="lg" className="rounded-2xl h-14 px-10 font-black shadow-xl" onClick={() => approveRequest(request.id, request.route_id, request.agency_uid)} isLoading={loadingStates[`approve-request-${request.id}`]}>
                                  Grant Access
                                </Button>
                                <Button variant="ghost" size="lg" className="rounded-2xl h-14 px-10 font-bold hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => denyRequest(request.id)} isLoading={loadingStates[`deny-request-${request.id}`]}>
                                  Revoke
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeTab === "routes" && (
                <motion.div
                  key="routes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                      <h2 className="text-4xl font-black tracking-tight mb-1">Route Library</h2>
                      <p className="text-sm text-muted-foreground font-medium">Manage and provision the system journey catalog</p>
                    </div>
                    <Button size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl" onClick={() => {
                      setEditingRouteId(null);
                      setRouteForm({
                        title: "",
                        subtitle: "",
                        path_slug: "",
                        asset_folder: "dummy",
                        total_frames: 1,
                        distance_km: 0,
                        duration_hours: 0,
                        hero_image: "",
                        status: "inactive"
                      });
                      setShowRouteModal(true);
                    }}>
                      <Plus className="mr-2 w-6 h-6" />
                      Create New Route
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allRoutes.map((route) => {
                      const isValid = true; // Feature disabled: availableFolders.includes(route.path_slug);
                      const isActive = route.status === "active";
                      return (
                        <Card key={route.id} className={`rounded-[2.5rem] border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl p-8 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                            {!isValid && (
                              <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-none font-bold shadow-lg backdrop-blur-md">Invalid Folder</Badge>
                            )}
                            <Badge className={`${isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                              } border font-bold shadow-lg backdrop-blur-md`}>
                              {isActive ? '● Active' : '○ Inactive'}
                            </Badge>
                          </div>
                          <h3 className="font-black text-xl mb-6 group-hover:text-primary transition-colors tracking-tight uppercase">{route.title}</h3>
                          <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                              <span>Distance</span>
                              <span className="text-foreground opacity-100">{route.distance_km} km</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                              <span>Duration</span>
                              <span className="text-foreground opacity-100">{route.duration_hours} hrs</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                              <span>Sponsors</span>
                              <Badge className="bg-primary/20 text-primary border-none font-black text-[10px]">{route.sponsor_count || 0} Partners</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={isActive ? "destructive" : "default"}
                              className={`flex-1 h-12 rounded-xl font-bold ${isActive ? '' : 'bg-green-600 hover:bg-green-700'}`}
                              onClick={() => toggleRouteStatus(route.id, route.status || "inactive")}
                              isLoading={loadingStates[`toggle-route-${route.id}`]}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              className="h-12 w-12 rounded-xl border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all font-bold"
                              onClick={() => openEditModal(route)}
                            >
                              <Settings className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              className="h-12 w-12 rounded-xl border border-red-500/30 text-red-500 hover:bg-destructive hover:text-white hover:border-destructive transition-all"
                              onClick={() => deleteRoute(route.id)}
                              isLoading={loadingStates[`delete-route-${route.id}`]}
                            >
                              <XCircle className="w-5 h-5" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Create Route Modal */}
      <AnimatePresence>
        {showRouteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={() => setShowRouteModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[3rem] p-12 shadow-3xl overflow-y-auto max-h-[90vh] border border-white/10"
            >
              <div className="relative">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapIcon className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">{editingRouteId ? 'Edit Manifest' : 'Provision Journey'}</h2>
                </div>

                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Manifest Title</label>
                      <Input
                        value={routeForm.title}
                        onChange={(e) => setRouteForm({ ...routeForm, title: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all"
                        placeholder="e.g. Silk Road Heritage"
                      />
                    </div>
                    {editingRouteId ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">System Slug (Locked)</label>
                        <Input
                          value={routeForm.path_slug}
                          disabled
                          className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all font-mono opacity-50 cursor-not-allowed"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Route Folder (Slug)</label>
                        <Input
                          id="asset_folder"
                          value={routeForm.asset_folder}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRouteForm({ ...routeForm, asset_folder: val, path_slug: val });
                          }}
                          className="bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20"
                          placeholder="e.g. siliguri-darjeeling"
                        />
                        <div className="text-xs text-muted-foreground ml-1">
                          Select a folder from <code>public/routes</code>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Editorial Subtitle</label>
                    <Input
                      value={routeForm.subtitle}
                      onChange={(e) => setRouteForm({ ...routeForm, subtitle: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all"
                      placeholder="A cinematic journey through timeless high-mountain passes"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Asset Directory</label>
                      <Input
                        value={routeForm.asset_folder}
                        onChange={(e) => setRouteForm({ ...routeForm, asset_folder: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all font-mono"
                        placeholder="e.g. siliguri-darjeeling"
                      />
                      <p className="text-xs text-muted-foreground ml-1">Folder name in <code className="bg-white/10 px-1.5 py-0.5 rounded">public/routes/</code></p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Frame Count</label>
                      <Input
                        type="number"
                        value={routeForm.total_frames}
                        onChange={(e) => setRouteForm({ ...routeForm, total_frames: Number(e.target.value) })}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Total Distance (km)</label>
                      <Input
                        type="number"
                        value={routeForm.distance_km}
                        onChange={(e) => setRouteForm({ ...routeForm, distance_km: Number(e.target.value) })}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">Journey Time (hrs)</label>
                      <Input
                        type="number"
                        value={routeForm.duration_hours}
                        onChange={(e) => setRouteForm({ ...routeForm, duration_hours: Number(e.target.value) })}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">High-Res Hero Image URL</label>
                    <Input
                      value={routeForm.hero_image}
                      onChange={(e) => setRouteForm({ ...routeForm, hero_image: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div className="flex gap-6 pt-8">
                    <Button
                      size="lg"
                      className="flex-1 h-16 rounded-2xl text-lg font-black shadow-2xl"
                      onClick={handleRouteSubmit}
                      isLoading={loadingStates['route-submit']}
                    >
                      {editingRouteId ? 'Update Manifest' : 'Initialize Journey'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="h-16 rounded-2xl px-12 font-bold hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => setShowRouteModal(false)}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Agency Details Modal */}
      <Modal
        isOpen={!!selectedAgency}
        onClose={() => setSelectedAgency(null)}
        title="Agency Dossier"
        className="bg-white/90 dark:bg-zinc-900/95 backdrop-blur-3xl border border-white/10"
      >
        {selectedAgency && (
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              {selectedAgency.logo_url ? (
                <div className="w-24 h-24 rounded-3xl bg-white p-2 border border-white/20 shadow-xl shrink-0 overflow-hidden">
                  <Image
                    src={selectedAgency.logo_url}
                    alt="Logo"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-4xl font-black text-primary">{selectedAgency.name?.[0] || 'A'}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 uppercase tracking-widest text-[10px] font-black px-3 py-1">
                    {selectedAgency.is_verified ? 'Verified Partner' : 'Pending Verification'}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">ID: {selectedAgency.uid?.slice(0, 8)}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-none mb-3">{selectedAgency.name || selectedAgency.email}</h2>
                {selectedAgency.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                    <span>{selectedAgency.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Email Address</p>
                  <p className="font-medium text-sm">{selectedAgency.email}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Contact Number</p>
                  <p className="font-medium text-sm">{selectedAgency.contact_no || 'Not provided'}</p>
                </div>
              </div>
              {selectedAgency.whatsapp && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">WhatsApp</p>
                    <p className="font-medium text-sm">{selectedAgency.whatsapp}</p>
                  </div>
                </div>
              )}
              {selectedAgency.website && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Website</p>
                    <a href={selectedAgency.website} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:underline hover:text-blue-400 truncate block max-w-[200px]">
                      {selectedAgency.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-14 rounded-2xl px-6 font-bold border-primary/20 hover:bg-primary/5 text-primary"
                onClick={() => setSelectedAgency(null)}
              >
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Message Notifications */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]"
          >
            <Alert variant={messageType as any} className="shadow-3xl border-none p-6 rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-black/90 min-w-[320px]">
              {message}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
