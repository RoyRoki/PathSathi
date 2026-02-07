import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, Mountain } from "lucide-react";

export default function ComingSoonPage() {
    return (
        <main className="min-h-screen bg-[#F0F4F2] flex items-center justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <Container className="relative z-10">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm mb-8">
                        <Mountain className="w-10 h-10 text-primary" />
                    </div>

                    <h1 className="font-display text-4xl md:text-6xl text-primary leading-tight">
                        New Horizons <br /> <span className="text-accent">Coming Soon.</span>
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                        We are currently mapping this route to bring you the most immersive 3D experience possible. The tea gardens and peaks are waiting.
                    </p>

                    <div className="pt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return Home
                        </Link>
                    </div>
                </div>
            </Container>
        </main>
    );
}
