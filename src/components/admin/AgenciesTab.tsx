import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Users, Map as MapIcon } from "lucide-react";

type AgenciesTabProps = {
    allAgencies: any[];
    agencyRoutes: Record<string, any[]>;
    agencySearchQuery: string;
    setAgencySearchQuery: (query: string) => void;
    toggleAgencyStatus: (agencyId: string, currentStatus: string) => void;
    revokeRoute: (agencyId: string, routeId: string) => void;
    loadingStates: Record<string, boolean>;
    requests: any[];
    approveRequest: (requestId: string, routeId: string, agencyUid: string) => void;
};

export function AgenciesTab({
    allAgencies,
    agencyRoutes,
    agencySearchQuery,
    setAgencySearchQuery,
    toggleAgencyStatus,
    revokeRoute,
    loadingStates,
    requests,
    approveRequest
}: AgenciesTabProps) {
    const filteredAgencies = allAgencies.filter(agency =>
        agency.name?.toLowerCase().includes(agencySearchQuery.toLowerCase()) ||
        agency.email?.toLowerCase().includes(agencySearchQuery.toLowerCase()) ||
        agency.contact_no?.includes(agencySearchQuery)
    );

    return (
        <Card className="rounded-[3rem] p-12 border border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-3xl shadow-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <h2 className="text-4xl font-black tracking-tight">Agency Management</h2>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        value={agencySearchQuery}
                        onChange={(e) => setAgencySearchQuery(e.target.value)}
                        className="pl-11 pr-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64 placeholder:text-muted-foreground/50"
                        placeholder="Search agencies..."
                    />
                </div>
            </div>

            {filteredAgencies.length === 0 ? (
                <div className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
                    <Users className="w-16 h-16 mx-auto mb-6 text-primary/30" />
                    <p className="text-muted-foreground text-lg font-light italic">
                        {agencySearchQuery ? "No agencies match your search." : "No agencies registered yet."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredAgencies.map((agency) => {
                        const routes = agencyRoutes[agency.id] || [];
                        const pendingRequests = (requests || []).filter(r => r.agency_uid === agency.id && r.status === "pending");
                        const isActive = agency.status === "active";

                        return (
                            <div key={agency.id} className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${isActive ? 'bg-green-500' : 'bg-red-500'} opacity-70`} />

                                {/* Header */}
                                <div className="flex items-start justify-between gap-6 mb-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        {agency.logo_url ? (
                                            <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-white/20 shadow-lg shrink-0">
                                                <Image
                                                    src={agency.logo_url}
                                                    alt="Logo"
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-2xl font-black text-primary">{agency.name?.[0] || 'A'}</span>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="font-black text-xl tracking-tight">{agency.name || agency.email}</h3>
                                                <Badge
                                                    variant="outline"
                                                    className={`uppercase text-[10px] font-black px-2 py-0.5 ${isActive
                                                        ? 'border-green-500/30 text-green-500 bg-green-500/10'
                                                        : 'border-red-500/30 text-red-500 bg-red-500/10'
                                                        }`}
                                                >
                                                    {isActive ? 'Active' : 'Disabled'}
                                                </Badge>
                                                {agency.is_verified && (
                                                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 uppercase text-[10px] font-black px-2 py-0.5">
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{agency.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {routes.length > 0 || pendingRequests.length > 0 ? (
                                    <div className="mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Route Subscriptions</p>
                                        <div className="space-y-3">
                                            {/* Active Routes */}
                                            {routes.map((route) => {
                                                const routeTrialStart = route.trial_start?.toDate?.();
                                                const routeTrialExpiry = route.trial_expiry?.toDate?.();
                                                const daysLeft = routeTrialExpiry ? Math.ceil((routeTrialExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

                                                return (
                                                    <div key={route.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <MapIcon className="w-4 h-4 text-primary shrink-0" />
                                                                <span className="text-sm font-bold">{route.route_id}</span>
                                                            </div>
                                                            {daysLeft !== null && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`shrink-0 ${daysLeft > 3
                                                                        ? 'border-green-500/30 text-green-500 bg-green-500/10'
                                                                        : daysLeft > 0
                                                                            ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                                                                            : 'border-red-500/30 text-red-500 bg-red-500/10'
                                                                        }`}
                                                                >
                                                                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {routeTrialStart && routeTrialExpiry && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Trial: {routeTrialStart.toLocaleDateString()} - {routeTrialExpiry.toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        <div className="mt-3 flex justify-end">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => revokeRoute(agency.id, route.route_id || route.id)}
                                                                isLoading={loadingStates[`revoke-${agency.id}-${route.route_id || route.id}`]}
                                                            >
                                                                Disapprove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Pending Requests */}
                                            {pendingRequests.map((req) => (
                                                <div key={req.id} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                                                    <div className="flex items-start justify-between gap-4 mb-3">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <MapIcon className="w-4 h-4 text-amber-500 shrink-0" />
                                                            <span className="text-sm font-bold">{req.route_id}</span>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 border-amber-500/30 text-amber-500 bg-amber-500/10 animate-pulse"
                                                        >
                                                            Pending Approval
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-3 flex justify-end">
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg shadow-amber-500/20"
                                                            onClick={() => approveRequest(req.id, req.route_id, agency.id)}
                                                            isLoading={loadingStates[`approve-request-${req.id}`]}
                                                        >
                                                            Approve Request
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                                        <p className="text-sm text-muted-foreground italic">No route subscriptions</p>
                                    </div>
                                )}

                                {/* Agency-Level Actions */}
                                <div className="flex gap-4">
                                    <Button
                                        size="lg"
                                        variant={isActive ? "destructive" : "default"}
                                        className={`flex-1 rounded-2xl h-14 font-black shadow-xl ${!agency.is_verified && isActive ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                                        onClick={() => toggleAgencyStatus(agency.id, agency.status || "active")}
                                        isLoading={loadingStates[`toggle-agency-${agency.id}`]}
                                    >
                                        {!agency.is_verified && isActive ? 'Verify Agency' : isActive ? 'Disable Agency' : 'Enable Agency'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
