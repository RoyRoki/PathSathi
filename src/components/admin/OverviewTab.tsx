import { motion } from "framer-motion";
import { ShieldAlert, Map as MapIcon, Bell, Activity, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Agency, RoutePurchaseRequest, Route } from "@/lib/types";
import { AdminTab } from "./Sidebar";

interface OverviewTabProps {
    allRoutes: Route[];
    agencies: Agency[];
    requests: RoutePurchaseRequest[];
    setActiveTab: (tab: AdminTab) => void;
    seedInitialData: () => Promise<void>;
    loadingSeed: boolean;
}

export function OverviewTab({ allRoutes, agencies, requests, setActiveTab, seedInitialData, loadingSeed }: OverviewTabProps) {
    const mainStats = [
        { label: "Total Routes", value: allRoutes.length, icon: MapIcon, color: "text-primary", bg: "bg-primary/10" },
        { label: "Pending Verification", value: agencies.length, icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Open Requests", value: requests.length, icon: Bell, color: "text-secondary", bg: "bg-secondary/10" }
    ];

    return (
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
                        <Button variant="outline" size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl border-white/20 hover:bg-white/10" onClick={seedInitialData} isLoading={loadingSeed}>
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
    );
}
