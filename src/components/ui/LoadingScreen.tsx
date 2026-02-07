'use client'

import dynamic from 'next/dynamic';
import '@dotlottie/react-player/dist/index.css';

const DotLottiePlayer = dynamic(
    () => import('@dotlottie/react-player').then((mod) => mod.DotLottiePlayer),
    { ssr: false }
);
import { getAssetPath } from '@/lib/utils'

interface LoadingScreenProps {
    progress?: number;
    backgroundImage?: string;
}

export function LoadingScreen({ progress, backgroundImage }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-[100] flex h-screen w-full items-center justify-center bg-background/80 backdrop-blur-sm overflow-hidden">
            {/* Background Image if available */}
            {backgroundImage && (
                <>
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-md" />
                </>
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="h-48 w-48 md:h-64 md:w-64">
                    <DotLottiePlayer
                        src={getAssetPath("/loading.lottie")}
                        autoplay
                        loop
                        className="h-full w-full"
                    />
                </div>
                {/* Optional text if desired, consistent with old loader but using Lottie style */}
                <p className={`text-sm font-medium uppercase tracking-widest animate-pulse ${backgroundImage ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {progress !== undefined ? `Preparing Journey... ${progress}%` : 'Preparing Journey...'}
                </p>

                {/* Progress Bar */}
                {progress !== undefined && (
                    <div className="w-48 h-1 bg-gray-200/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
