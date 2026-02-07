/** @type {import('next').NextConfig} */
// Use GITHUB_ACTIONS to detect GitHub Pages deployment
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // Only use static export for GitHub Pages, Vercel uses server-side rendering
  ...(isGitHubPages && { output: 'export' }),
  basePath: isGitHubPages ? '/PathSathi' : '',
  assetPrefix: isGitHubPages ? '/PathSathi/' : '',
  images: {
    unoptimized: isGitHubPages
  },
  trailingSlash: true,
  reactStrictMode: true,

  // Disable webpack cache for stability during development
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
