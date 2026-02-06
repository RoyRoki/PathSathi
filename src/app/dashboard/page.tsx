"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import { routes as mockRoutes } from "@/lib/mock-data";
import { getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  User,
  Map as MapIcon,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Activity,
  Award
} from "lucide-react";

const emptyProfile = {
  name: "",
  contact_no: "",
  whatsapp: "",
  address: "",
  website: ""
};

type AgencyDoc = {
  uid: string;
  email: string;
  name: string;
  contact_no: string;
  whatsapp?: string;
  address: string;
  website?: string;
  is_verified: boolean;
  status: string;
  trial_start?: any;
  trial_expiry?: any;
};

type RouteDoc = {
  id: string;
  title: string;
  subtitle: string;
  path_slug: string;
  distance_km?: number;
  duration_hours?: number;
  hero_image?: string;
};

type PurchaseDoc = {
  id: string;
  route_id: string;
  status: string;
};

type Tab = "profile" | "my-routes" | "marketplace";

export default function DashboardPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [agency, setAgency] = useState<AgencyDoc | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [routes, setRoutes] = useState<RouteDoc[]>([]);
  const [purchases, setPurchases] = useState<PurchaseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [selectedRoute, setSelectedRoute] = useState<RouteDoc | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const routeMap = useMemo(() => {
    return new Map(routes.map((route) => [route.id, route]));
  }, [routes]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const firestore = getFirestoreDb();

    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setUserUid(user.uid);
      setEmail(user.email);
      await loadAgency(user.uid);
      await loadRoutes();
      await loadPurchases(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadAgency = async (uid: string) => {
    const firestore = getFirestoreDb();
    if (!firestore) return;
    const ref = doc(firestore, "agencies", uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      const data = snapshot.data() as AgencyDoc;
      setAgency(data);
      setProfile({
        name: data.name || "",
        contact_no: data.contact_no || "",
        whatsapp: data.whatsapp || "",
        address: data.address || "",
        website: data.website || ""
      });
    }
  };

  const loadRoutes = async () => {
    const firestore = getFirestoreDb();
    if (!firestore) {
      setRoutes(
        mockRoutes.map((route) => ({
          id: route.id,
          title: route.title,
          subtitle: route.subtitle,
          path_slug: route.slug
        }))
      );
      return;
    }
    const snapshot = await getDocs(collection(firestore, "routes"));
    if (snapshot.empty) {
      setRoutes(
        mockRoutes.map((route) => ({
          id: route.id,
          title: route.title,
          subtitle: route.subtitle,
          path_slug: route.slug
        }))
      );
      return;
    }
    const docs = snapshot.docs.map((docItem) => {
      const data = docItem.data() as Omit<RouteDoc, "id">;
      return { id: docItem.id, ...data };
    });
    setRoutes(docs);
  };

  const loadPurchases = async (uid: string) => {
    const firestore = getFirestoreDb();
    if (!firestore) return;
    const snapshot = await getDocs(
      query(collection(firestore, "routePurchases"), where("agency_uid", "==", uid))
    );
    const docs = snapshot.docs.map((docItem) => {
      const data = docItem.data() as Omit<PurchaseDoc, "id">;
      return { id: docItem.id, ...data };
    });
    setPurchases(docs);
  };

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const saveProfile = async () => {
    if (!userUid || !email) return;
    setIsSaving(true);

    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      const isNew = !agency;
      const payload: Record<string, any> = {
        uid: userUid,
        email,
        name: profile.name,
        contact_no: profile.contact_no,
        whatsapp: profile.whatsapp,
        address: profile.address,
        website: profile.website,
        updated_at: serverTimestamp()
      };

      if (isNew) {
        payload.is_verified = false;
        payload.status = "pending_verification";
        payload.trial_start = null;
        payload.trial_expiry = null;
        payload.created_at = serverTimestamp();
      }

      await setDoc(doc(firestore, "agencies", userUid), payload, { merge: true });
      await loadAgency(userUid);

      showMessage(
        agency?.is_verified
          ? "Profile updated successfully!"
          : "Profile saved. Awaiting admin verification.",
        "success"
      );
    } catch (error) {
      showMessage("Failed to save profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const requestRoute = async (routeId: string) => {
    if (!userUid) return;

    if (!agency?.is_verified) {
      showMessage("You must be verified by admin before requesting a route.", "error");
      return;
    }

    if (purchases.length >= 1) {
      showMessage("Beta plan allows only one route request.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const docId = `${userUid}_${routeId}`;
      const firestore = getFirestoreDb();
      if (!firestore) return;

      await setDoc(
        doc(firestore, "routePurchases", docId),
        {
          agency_uid: userUid,
          route_id: routeId,
          status: "pending",
          created_at: serverTimestamp()
        },
        { merge: true }
      );

      await loadPurchases(userUid);
      setShowRequestModal(false);
      setSelectedRoute(null);
      showMessage("Route request submitted for admin approval!", "success");
    } catch (error) {
      showMessage("Failed to submit route request.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const trialLabel = useMemo(() => {
    if (!agency?.trial_expiry) return "Trial starts after verification";
    const date = agency.trial_expiry?.toDate?.();
    if (!date) return "Trial starts after verification";
    return `Access until ${date.toLocaleDateString()}`;
  }, [agency]);

  const verificationStatus = useMemo(() => {
    if (!agency) return { variant: "pending" as const, text: "Unregistered", icon: AlertCircle, color: "text-amber-500" };
    if (agency.is_verified) return { variant: "verified" as const, text: "Verified", icon: ShieldCheck, color: "text-primary" };
    if (agency.status === "denied") return { variant: "denied" as const, text: "Denied", icon: AlertCircle, color: "text-destructive" };
    return { variant: "pending" as const, text: "Review Pending", icon: Clock, color: "text-amber-500" };
  }, [agency]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Authenticating Access...</p>
        </div>
      </div>
    );
  }

  if (!userUid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="rounded-[2.5rem] p-12 max-w-lg w-full text-center border-none shadow-3xl bg-white/50 dark:bg-black/20 backdrop-blur-3xl">
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl font-bold mb-4 tracking-tight">Partner Dashboard</h1>
          <p className="text-muted-foreground text-lg font-light mb-8 leading-relaxed">
            Please authenticate your agency credentials to access the partner portal.
          </p>

          <Link href="/login">
            <Button size="lg" className="w-full h-14 rounded-2xl text-base font-bold shadow-xl">
              Go to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as Tab, label: "Agency Profile", icon: User },
    { id: "my-routes" as Tab, label: "Your Journeys", icon: MapIcon, badge: purchases.length > 0 ? purchases.length : undefined },
    { id: "marketplace" as Tab, label: "Marketplace", icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 opacity-30 dark:opacity-20 pointer-events-none">
        <Image
          src={getAssetPath("/images/dashboard-bg.png")}
          alt="Dashboard Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Top Bar */}
      <header className="border-b border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">PathSathi <span className="text-primary font-black ml-1">Partner</span></h1>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {email}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex h-9 px-4 rounded-full border-primary/20 text-primary bg-primary/5 gap-2">
                <verificationStatus.icon className="w-4 h-4" />
                {verificationStatus.text}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl w-11 h-11 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  const auth = getFirebaseAuth();
                  if (auth) signOut(auth);
                }}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Verification Alert */}
        {!agency?.is_verified && (
          <div className="mb-10 p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl animate-fade-in-up-premium">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-amber-800 dark:text-amber-500">Awaiting Account Approval</h3>
                <p className="text-amber-800/70 dark:text-amber-500/70 font-light leading-relaxed">
                  Our team is currently verifying your agency credentials. You'll gain full access to sponsor routes once approved.
                </p>
              </div>
              <Badge className="bg-amber-500 text-white border-none px-4 py-1">Reviewing</Badge>
            </div>
          </div>
        )}

        {/* Status Message Overlay */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
            >
              <Alert variant={messageType as any} className="shadow-3xl border-none p-6 rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-black/90 min-w-[320px]">
                {message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Sidebar Navigation */}
          <aside className="space-y-2 sticky top-32">
            <div className="px-4 mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Main Menu</h2>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold tracking-tight transition-all relative overflow-hidden group ${activeTab === tab.id
                  ? "bg-primary text-white shadow-xl translate-x-1"
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge && (
                  <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}>
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                )}
              </button>
            ))}
          </aside>

          {/* Content Panel */}
          <main className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-[2.5rem] p-10 border-none bg-white/40 dark:bg-black/20 backdrop-blur-3xl shadow-2xl">
                    <div className="flex items-center justify-between mb-10 pb-8 border-b border-border/30">
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-1">Agency Identity</h2>
                        <p className="text-muted-foreground font-light italic">{trialLabel}</p>
                      </div>
                      <div className={`p-4 rounded-2xl bg-background/50 border border-border/50 flex items-center gap-3`}>
                        <div className={`w-3 h-3 rounded-full bg-current ${verificationStatus.color} animate-pulse`} />
                        <span className={`text-sm font-bold uppercase tracking-widest ${verificationStatus.color}`}>{verificationStatus.text}</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <Input
                          label="Agency Full Name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="bg-background/20 rounded-2xl h-14"
                        />
                        <Input
                          label="Contact Hotline"
                          value={profile.contact_no}
                          onChange={(e) => setProfile({ ...profile, contact_no: e.target.value })}
                          className="bg-background/20 rounded-2xl h-14"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <Input
                          label="Business WhatsApp"
                          value={profile.whatsapp}
                          onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                          className="bg-background/20 rounded-2xl h-14"
                        />
                        <Input
                          label="Official Website"
                          value={profile.website}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                          className="bg-background/20 rounded-2xl h-14"
                        />
                      </div>

                      <Input
                        label="Registered Office Address"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        className="bg-background/20 rounded-2xl h-14"
                      />

                      <div className="pt-8 flex justify-end">
                        <Button
                          size="lg"
                          className="rounded-2xl h-16 px-12 text-base font-bold shadow-2xl group transition-all hove:scale-105"
                          onClick={saveProfile}
                          isLoading={isSaving}
                        >
                          Keep Changes
                          <CheckCircle2 className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === "my-routes" && (
                <motion.div
                  key="my-routes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-[2.5rem] p-10 border-none bg-white/40 dark:bg-black/20 backdrop-blur-3xl shadow-2xl">
                    <h2 className="text-3xl font-bold tracking-tight mb-8">Owned Journeys</h2>

                    {purchases.length === 0 ? (
                      <div className="text-center py-24 bg-background/20 rounded-[2.5rem] border-2 border-dashed border-border/50">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/5 flex items-center justify-center">
                          <MapIcon className="w-10 h-10 text-primary/30" />
                        </div>
                        <p className="text-muted-foreground text-lg font-light mb-8 italic">Your portfolio is awaiting its first iconic route.</p>
                        <Button size="lg" className="rounded-2xl h-14 font-bold" onClick={() => setActiveTab("marketplace")}>
                          Explore Marketplace
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {purchases.map((purchase) => {
                          const route = routeMap.get(purchase.route_id);
                          const isPending = purchase.status === "pending";
                          return (
                            <div
                              key={purchase.id}
                              className="group relative overflow-hidden rounded-3xl p-8 bg-background/40 border border-border/50 hover:bg-white/80 dark:hover:bg-white/5 transition-all hover:shadow-xl"
                            >
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-2xl tracking-tight">{route?.title ?? purchase.route_id}</h3>
                                    <Badge variant={purchase.status as any} className="h-6 px-3">
                                      {purchase.status}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground font-light">{route?.subtitle || "Premium Expedition Route"}</p>

                                  <div className="flex items-center gap-6 mt-4 text-sm font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-4 h-4 text-primary" />
                                      {route?.distance_km || 0} km
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4 text-accent" />
                                      {route?.duration_hours || 0} hrs
                                    </div>
                                  </div>
                                </div>

                                {!isPending && route && (
                                  <Link href={`/routes/${route.path_slug}?tid=${userUid}`}>
                                    <Button className="h-14 rounded-2xl px-8 font-bold group shadow-lg">
                                      Open Journey
                                      <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                  </Link>
                                )}

                                {isPending && (
                                  <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/5 text-amber-500 border border-amber-500/10 italic text-sm font-medium">
                                    <Clock className="w-4 h-4" />
                                    Locked during review
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeTab === "marketplace" && (
                <motion.div
                  key="marketplace"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-[2.5rem] p-10 border-none bg-white/40 dark:bg-black/20 backdrop-blur-3xl shadow-2xl">
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold tracking-tight mb-2">Route Marketplace</h2>
                      <p className="text-muted-foreground font-light max-w-lg">Claim exclusive sponsorship for our high-impact Himalayan 3D journeys.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {routes.map((route) => {
                        const isOwned = purchases.some(p => p.route_id === route.id);
                        return (
                          <Card key={route.id} className="relative overflow-hidden rounded-[2rem] border-none bg-background/50 group hover:shadow-3xl transition-all duration-500">
                            <div className="relative h-48 w-full overflow-hidden">
                              <Image
                                src={route.hero_image || getAssetPath("/images/mountain_road_journey_1770289426463.png")}
                                alt={route.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                              <div className="absolute bottom-4 left-6">
                                <Badge className="bg-white/20 backdrop-blur-md border border-white/30 text-white mb-2">Signature Route</Badge>
                                <h3 className="font-bold text-2xl text-white tracking-tight">{route.title}</h3>
                              </div>
                            </div>

                            <div className="p-8">
                              <p className="text-muted-foreground text-sm font-light mb-6 line-clamp-2 leading-relaxed italic">
                                {route.subtitle}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                                  <Activity className="w-3.5 h-3.5" />
                                  Beta Phase
                                </div>

                                <Button
                                  size="sm"
                                  className={`rounded-xl h-11 px-6 font-bold shadow-lg transition-all ${isOwned ? "bg-green-500 hover:bg-green-600" : ""
                                    }`}
                                  onClick={() => {
                                    setSelectedRoute(route);
                                    setShowRequestModal(true);
                                  }}
                                  disabled={isOwned || !agency?.is_verified || purchases.length >= 1}
                                >
                                  {isOwned
                                    ? "Owned"
                                    : !agency?.is_verified
                                      ? "Awaiting Verification"
                                      : purchases.length >= 1
                                        ? "Beta Limit"
                                        : "Sponsor Route"}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Request Route Modal */}
      <AnimatePresence>
        {showRequestModal && selectedRoute && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={() => setShowRequestModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[3rem] p-12 shadow-3xl overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />

              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <Award className="w-10 h-10 text-primary" />
                </div>

                <h2 className="text-4xl font-black mb-4 tracking-tight">Confirm Exclusive Sponsorship</h2>
                <p className="text-muted-foreground text-lg font-light mb-10 leading-relaxed italic">
                  You are requesting exclusive partner rights for the <span className="text-foreground font-bold not-italic">{selectedRoute.title}</span> trail. This will showcase your agency to all travelers on this path.
                </p>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest leading-none">Beta Milestone: 1 Route Per Agency</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1 h-16 rounded-2xl text-lg font-bold shadow-2xl"
                    onClick={() => requestRoute(selectedRoute.id)}
                    isLoading={isSaving}
                  >
                    Confirm & Claim
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-16 rounded-2xl px-10 font-bold hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedRoute(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
