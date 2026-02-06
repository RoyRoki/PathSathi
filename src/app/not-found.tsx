"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-[120px] font-bold text-accent/20 leading-none mb-4">
                        404
                    </div>

                    <h1 className="text-3xl font-bold mb-4">Off the Beaten Path?</h1>
                    <p className="text-muted-foreground mb-8">
                        The page you're looking for seems to have wandered off into the mountains.
                        Let's get you back on the main trail.
                    </p>

                    <div className="flex flex-col gap-3 justify-center">
                        <Link href="/">
                            <Button variant="default" size="lg" className="w-full">
                                Return Home
                            </Button>
                        </Link>
                        <Link href="/routes">
                            <Button variant="ghost" className="w-full">
                                Explore Routes
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
