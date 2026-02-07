import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
    return (
        <main className="pt-32 pb-24 min-h-screen bg-background">
            <Container className="max-w-3xl">
                <div className="mb-12 text-center">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight font-display text-primary sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last Updated: February 2026
                    </p>
                </div>

                <div className="space-y-8 text-base leading-relaxed text-foreground/80">
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">1. Introduction</h2>
                        <p>
                            At PathSathi ("we," "our," or "us"), we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our platform to explore routes and connect with travel agencies.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">2. Information We Collect</h2>
                        <p className="mb-2">We collect information that allows us to provide the best experience:</p>
                        <ul className="pl-6 list-disc space-y-2 marker:text-accent">
                            <li><strong>Personal Information:</strong> Name, email address, and phone number when you sign up or contact an agency.</li>
                            <li><strong>Usage Data:</strong> Information about how you navigate our 3D routes and interact with the site.</li>
                            <li><strong>Device Information:</strong> Browser type, IP address, and operating system for security and optimization.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">3. How We Use Your Information</h2>
                        <p className="mb-2">We use your data to:</p>
                        <ul className="pl-6 list-disc space-y-2 marker:text-accent">
                            <li>Connect you directly with verified travel agencies.</li>
                            <li>Improve our immersive scroll-driven technology.</li>
                            <li>Send important updates regarding your account or platform changes.</li>
                            <li>Maintain the security and integrity of our platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">4. Sharing with Agencies</h2>
                        <p>
                            When you choose to contact an agency through PathSathi, we share your provided contact details ensuring they can reach out to you directly. We do not sell your data to third-party advertisers.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">5. Terms of Service</h2>
                        <p>
                            By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-primary">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at support@pathsathi.com.
                        </p>
                    </section>
                </div>
            </Container>
        </main>
    );
}
