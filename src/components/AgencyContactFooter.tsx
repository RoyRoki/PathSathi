import { MapPin, Phone, Mail, Globe, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Agency } from "@/lib/types";

type AgencyContactFooterProps = {
    agency: Agency;
};

export function AgencyContactFooter({ agency }: AgencyContactFooterProps) {
    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="relative overflow-hidden rounded-3xl bg-[#0B1121] border border-white/10 shadow-2xl p-6 md:p-8">

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

                    {/* Logo Section */}
                    <div className="shrink-0">
                        {agency.logoUrl ? (
                            <div className="w-24 h-24 rounded-2xl bg-white p-2 border border-white/5 shadow-lg overflow-hidden flex items-center justify-center">
                                <Image
                                    src={agency.logoUrl}
                                    alt={agency.name}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center border border-white/5 shadow-lg">
                                <span className="text-3xl font-black text-black uppercase">{agency.name[0]}</span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">{agency.name}</h2>
                            {agency.isVerified && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Verified Partner</span>
                                </div>
                            )}
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            <strong className="text-white">Connect directly for route planning.</strong> Reach out via phone, email, or WhatsApp to customize this journey, discuss itineraries, and book your adventure.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {agency.contactNo && (
                                <a href={`tel:${agency.contactNo}`} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group text-sm text-slate-300">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{agency.contactNo}</span>
                                </a>
                            )}

                            {agency.email && (
                                <a href={`mailto:${agency.email}`} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group text-sm text-slate-300">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate max-w-[150px]">{agency.email}</span>
                                </a>
                            )}

                            {agency.address && (
                                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="truncate max-w-[150px]">{agency.address}</span>
                                </div>
                            )}

                            {agency.website && (
                                <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group text-sm text-slate-300">
                                    <Globe className="w-4 h-4 text-slate-400" />
                                    <span className="truncate max-w-[150px]">{agency.website.replace(/^https?:\/\//, '')}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
