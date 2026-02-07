"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function RequestSection() {
    const [formState, setFormState] = useState({
        name: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.message.length < 15) {
            setErrorMessage("Message must be at least 15 characters.");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formState),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setStatus("success");
            setFormState({ name: "", message: "" });

            // Reset success state after 3 seconds
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message);
        }
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Subtle background pattern - faint contour lines concept */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <Container>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                            The Custom Path
                        </span>
                        <h2 className="font-display text-4xl sm:text-5xl text-primary mb-6 leading-tight">
                            Can’t find the path you’re looking for?
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                            Whether you’re a traveler dreaming of a new 3D route or an agency with a
                            unique vision, tell us what you need. We’re building the future of
                            Himalayan travel, one scroll at a time.
                        </p>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                                    Name <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                                    Message <span className="text-accent">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    value={formState.message}
                                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400 resize-none"
                                    placeholder="Tell us about the route or feature you need..."
                                />
                                <div className="flex justify-between mt-2">
                                    <p className="text-xs text-red-500 min-h-[1.25rem]">{errorMessage}</p>
                                    <p className="text-xs text-muted-foreground text-right">
                                        {formState.message.length}/15 chars
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-medium transition-all duration-300 ${status === "success"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-primary hover:bg-primary/90 hover:scale-[1.02]"
                                    } disabled:opacity-70 disabled:hover:scale-100`}
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : status === "success" ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Sent!
                                    </>
                                ) : (
                                    <>
                                        Send Request
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
