import { motion } from "framer-motion";
import { Settings, Users, Bell, Map as MapIcon, LayoutDashboard, LucideIcon } from "lucide-react";

export type AdminTab = "overview" | "agencies" | "requests" | "routes";

interface SidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    agenciesCount: number;
    requestsCount: number;
}

export function Sidebar({ activeTab, setActiveTab, agenciesCount, requestsCount }: SidebarProps) {
    const tabs: { id: AdminTab; label: string; icon: LucideIcon; badge?: number }[] = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "agencies", label: "Agencies", icon: Users, badge: agenciesCount > 0 ? agenciesCount : undefined },
        { id: "requests", label: "Requests", icon: Bell, badge: requestsCount > 0 ? requestsCount : undefined },
        { id: "routes", label: "Route Library", icon: MapIcon }
    ];

    return (
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
    );
}
