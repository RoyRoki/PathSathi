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
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  increment
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  ShieldAlert,
  Users,
  Map as MapIcon,
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  LayoutDashboard,
  Activity,
  ArrowRight
} from "lucide-react";

const trialDays = 7;

type Tab = "overview" | "agencies" | "requests" | "routes";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);

  const [routeForm, setRouteForm] = useState({
    title: "",
    subtitle: "",
    path_slug: "",
    asset_folder: "dummy",
    total_frames: 1,
    distance_km: 0,
    duration_hours: 0,
    hero_image: ""
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
      const adminClaim = Boolean(tokenResult.claims.admin);
      setIsAdmin(adminClaim);
      setAuthChecked(true);
      if (adminClaim) {
        await loadAllData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadPending(), loadAllRoutes()]);
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

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Firebase is not configured.");
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      showMessage("Admin login failed. Please check your credentials.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const approveAgency = async (agencyId: string) => {
    setIsLoading(true);
    try {
      const expiry = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
      const firestore = getFirestoreDb();
      if (!firestore) return;

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
      setIsLoading(false);
    }
  };

  const denyAgency = async (agencyId: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const approveRequest = async (requestId: string, routeId: string, agencyUid: string) => {
    setIsLoading(true);
    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      await updateDoc(doc(firestore, "routePurchases", requestId), {
        status: "approved",
        approved_at: serverTimestamp()
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
      showMessage("Route request approved!", "success");
    } catch (error) {
      showMessage("Failed to approve request.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const denyRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      await updateDoc(doc(firestore, "routePurchases", requestId), {
        status: "denied"
      });

      await loadPending();
      showMessage("Route request denied.", "info");
    } catch (error) {
      showMessage("Failed to deny request.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const createRoute = async () => {
    if (!routeForm.path_slug || !routeForm.title) {
      showMessage("Please fill in route title and slug.", "error");
      return;
    }

    setIsLoading(true);
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
        hero_image: ""
      });

      setShowRouteModal(false);
      await loadAllRoutes();
      showMessage("Route created successfully!", "success");
    } catch (error) {
      showMessage("Failed to create route.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Initializing Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
        {/* Background Layer */}
        <div className="fixed inset-0 -z-10 opacity-60 pointer-events-none scale-105 animate-pulse-slow">
          <Image
            src="/images/login-bg.png"
            alt="Admin Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="fixed inset-0 -z-5 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 -z-5 noise-bg opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "power4.out" }}
          className="w-full max-w-lg"
        >
          <Card className="rounded-[3.5rem] p-16 border border-white/10 bg-black/40 backdrop-blur-3xl shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="relative text-center mb-12">
              <div className="w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-12 h-12 text-primary" />
              </div>

              <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">Terminal <span className="text-primary">Alpha</span></h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em] opacity-80">
                Authorized Personnel Only
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Identifier</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl h-16 bg-white/5 border-white/10 focus:bg-white/10 transition-all text-lg font-medium px-6"
                  placeholder="admin@pathsathi.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Security Key</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl h-16 bg-white/5 border-white/10 focus:bg-white/10 transition-all text-lg font-medium px-6"
                  placeholder="••••••••"
                />
              </div>
              <Button
                size="lg"
                className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl mt-8 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={login}
                isLoading={isLoading}
              >
                Establish Connection
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                Node 7-42-Beta • Secure Protocol v4.0
              </p>
            </div>
          </Card>
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
          src="/images/dashboard-bg.png"
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
              onClick={() => {
                const auth = getFirebaseAuth();
                if (auth) signOut(auth);
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
          <aside className="space-y-2 sticky top-32">
            <div className="px-4 mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Management Console</h2>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold tracking-tight transition-all relative overflow-hidden group ${activeTab === tab.id
                  ? "bg-primary text-white shadow-2xl translate-x-1"
                  : "text-muted-foreground hover:bg-white/10 dark:hover:bg-white/5 hover:text-foreground"
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
                      <Card key={i} className="p-8 border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl shadow-3xl hover:translate-y-[-6px] transition-all duration-500 group">
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
                    <h2 className="text-3xl font-black mb-8 tracking-tight">Executive Control</h2>
                    <div className="flex flex-wrap gap-6">
                      <Button size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl hover:scale-105 transition-transform" onClick={() => setActiveTab("routes")}>
                        <Plus className="mr-2 w-5 h-5" />
                        Provision New Journey
                      </Button>
                      {agencies.length > 0 && (
                        <Button variant="secondary" size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl hover:scale-105 transition-transform" onClick={() => setActiveTab("agencies")}>
                          Authorize {agencies.length} New Agencies
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
                  <Card className="rounded-[3rem] p-12 border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl shadow-3xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                      <h2 className="text-4xl font-black tracking-tight">Agency Authorization</h2>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input className="pl-11 pr-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64 placeholder:text-muted-foreground/50" placeholder="Search applications..." />
                      </div>
                    </div>

                    {agencies.length === 0 ? (
                      <div className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-primary/30" />
                        <p className="text-muted-foreground text-lg font-light italic">The backlog is clear. No agencies awaiting review.</p>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {agencies.map((agency) => (
                          <div key={agency.id} className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                                  <Users className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-black text-2xl tracking-tight leading-none mb-3">{agency.name || agency.email}</h3>
                                  <div className="flex flex-wrap gap-4 items-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                      <Activity className="w-4 h-4 text-primary" />
                                      {agency.email}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                      {agency.contact_no}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <Button size="lg" className="rounded-2xl h-14 px-10 font-black shadow-xl hover:scale-105 transition-transform" onClick={() => approveAgency(agency.id)} isLoading={isLoading}>
                                  <CheckCircle2 className="mr-2 w-5 h-5" />
                                  Authorize
                                </Button>
                                <Button variant="ghost" size="lg" className="rounded-2xl h-14 px-10 font-bold hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => denyAgency(agency.id)} isLoading={isLoading}>
                                  <XCircle className="mr-2 w-5 h-5" />
                                  Dismiss
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
                              <div className="flex gap-4">
                                <Button size="lg" className="rounded-2xl h-14 px-10 font-black shadow-xl hover:scale-105 transition-transform" onClick={() => approveRequest(request.id, request.route_id, request.agency_uid)} isLoading={isLoading}>
                                  Grant Access
                                </Button>
                                <Button variant="ghost" size="lg" className="rounded-2xl h-14 px-10 font-bold hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => denyRequest(request.id)} isLoading={isLoading}>
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
                      <h2 className="text-4xl font-black tracking-tight mb-1">Route Archive</h2>
                      <p className="text-sm text-muted-foreground font-medium">Manage and provision the system journey catalog</p>
                    </div>
                    <Button size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl hover:scale-105 transition-transform" onClick={() => setShowRouteModal(true)}>
                      <Plus className="mr-2 w-6 h-6" />
                      Add New Manifest
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allRoutes.map((route) => (
                      <Card key={route.id} className="rounded-[2.5rem] border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl p-8 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
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
                        <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all font-bold">
                          Configure Details
                        </Button>
                      </Card>
                    ))}
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
                  <h2 className="text-4xl font-black tracking-tight">Provision Journey</h2>
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">System Slug</label>
                      <Input
                        value={routeForm.path_slug}
                        onChange={(e) => setRouteForm({ ...routeForm, path_slug: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 focus:bg-white/10 transition-all font-mono"
                        placeholder="silk-road-heritage"
                      />
                    </div>
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
                      />
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
                      className="flex-1 h-16 rounded-2xl text-lg font-black shadow-2xl hover:scale-105 transition-transform"
                      onClick={createRoute}
                      isLoading={isLoading}
                    >
                      Initialize Journey
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
