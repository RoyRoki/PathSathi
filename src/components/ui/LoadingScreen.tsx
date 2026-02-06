'use client'

import { DotLottiePlayer } from '@dotlottie/react-player'
import '@dotlottie/react-player/dist/index.css'
import { getAssetPath } from '@/lib/utils'

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[100] flex h-screen w-full items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <div className="h-48 w-48 md:h-64 md:w-64">
                    <DotLottiePlayer
                        src={getAssetPath("/loading.lottie")}
                        autoplay
                        loop
                        className="h-full w-full"
                    />
                </div>
                {/* Optional text if desired, consistent with old loader but using Lottie style */}
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground animate-pulse">
                    Preparing Journey...
                </p>
            </div>
        </div>
    )
}
