"use client";

import { useEffect } from "react";

/**
 * GitHub Pages SPA redirect handler
 * Handles redirects from 404.html by parsing the encoded path from the URL
 */
export function GitHubPagesRedirect() {
    useEffect(() => {
        // Check if we have a redirect from 404.html
        const query = window.location.search;
        if (query.startsWith("?/")) {
            const redirect = query.slice(2).split("&")[0];
            if (redirect) {
                const decodedPath = redirect.replace(/~and~/g, "&");
                // Use Next.js router for navigation
                window.history.replaceState(null, "", `/${decodedPath}${window.location.hash}`);
            }
        }
    }, []);

    return null;
}
