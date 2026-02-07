import { Container } from "@/components/ui/Container";

export default function TermsPage() {
    return (
        <main className="pt-32 pb-24 min-h-screen bg-background">
            <Container className="max-w-3xl">
                <div className="mb-12 text-center">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight font-display text-primary sm:text-5xl">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last Updated: February 2026
                    </p>
                </div>

                <div className="space-y-8 text-base leading-relaxed text-foreground/80">
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using PathSathi, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">2. Platform Nature</h2>
                        <p>
                            PathSathi is a technology platform that connects travelers with independent local travel agencies. We are <strong>not</strong> a travel agency, tour operator, or transport provider. We provide the digital infrastructure for verified agencies to showcase their routes.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">3. User Conduct</h2>
                        <p className="mb-2">You agree not to:</p>
                        <ul className="pl-6 list-disc space-y-2 marker:text-accent">
                            <li>Use the platform for any unlawful purpose.</li>
                            <li>Attempt to gain unauthorized access to any portion of the site.</li>
                            <li>Harass or harm another user or agency.</li>
                            <li>Misrepresent your identity when contacting agencies.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">4. Agency Services</h2>
                        <p>
                            Any travel services, bookings, or agreements entered into are strictly between you (the Traveler) and the Agency. PathSathi is not a party to any rental or travel agreement and disclaims all liability arising from such agreements.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">5. Intellectual Property</h2>
                        <p>
                            The immersive scroll-driven technology, 3D assets, design, and code of PathSathi are the exclusive property of PathSathi and are protected by copyright and intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">6. Limitation of Liability</h2>
                        <p>
                            In no event shall PathSathi or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PathSathi's website.
                        </p>
                    </section>
                </div>
            </Container>
        </main>
    );
}
