import { Container } from "@/components/ui/Container";
import { Mountain } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="pt-32 pb-24 min-h-screen bg-background">
            <Container className="max-w-3xl">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 mb-6 rounded-2xl bg-secondary/10 text-primary">
                        <Mountain className="w-8 h-8" />
                    </div>
                    <h1 className="mb-6 text-4xl font-bold tracking-tight font-display text-primary sm:text-5xl">
                        Our Story
                    </h1>
                    <p className="text-xl leading-relaxed text-muted-foreground">
                        Crafted in Siliguri. Built for the Mountains.
                    </p>
                </div>

                <div className="space-y-8 text-lg leading-relaxed text-foreground/80 font-light">
                    <p>
                        PathSathi was born from a simple observation: the most authentic Himalayan experiences aren't found on major booking platforms. They are hidden in the notebooks of local drivers, the stories of tea garden workers, and the heritage of small, family-run agencies in Siliguri and Darjeeling.
                    </p>

                    <p>
                        We realized that while travelers crave connection, the digital gap prevents them from finding the true experts. Agencies often rely on word-of-mouth, while travelers get lost in generic listings.
                    </p>

                    <h2 className="pt-8 text-2xl font-semibold font-display text-primary">Bridging the Gap</h2>
                    <p>
                        We built PathSathi to be the bridge. We are not a travel agency; we are a technology partner for the people who know these mountains best. By bringing modern, immersive storytelling tools to local verified agencies, we empower them to showcase their routes in ways that static images never could.
                    </p>

                    <h2 className="pt-8 text-2xl font-semibold font-display text-primary">Our Mission</h2>
                    <p>
                        Our mission is simple: to democratize access to the Himalayan travel economy. We believe that when a traveler connects directly with a local expert, two things happen—the traveler gets a richer, safer experience, and the local economy drives forward with zero commission loss.
                    </p>

                    <div className="pt-12 mt-12 border-t border-border/40">
                        <p className="text-sm italic text-muted-foreground">
                            "For every road that leads to the mountains, there is a story. We help you tell it."
                        </p>
                        <p className="mt-2 text-sm font-medium text-primary">
                            — The PathSathi Team, Siliguri
                        </p>
                    </div>
                </div>
            </Container>
        </main>
    );
}
