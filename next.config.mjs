/** @type {import('next').NextConfig} */
// Use GITHUB_ACTIONS to detect GitHub Pages deployment
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  output: 'export',
  basePath: isGitHubPages ? '/PathSathi' : '',
  assetPrefix: isGitHubPages ? '/PathSathi/' : '',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: true
};

export default nextConfig;
