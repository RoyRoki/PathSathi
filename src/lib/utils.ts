import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Get the correct asset path for public folder assets
 * Handles both local development and GitHub Pages deployment
 */
export function getAssetPath(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // In production (GitHub Pages), add the base path
    const basePath = process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_BASE_PATH || '')
        : '';

    return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
}
