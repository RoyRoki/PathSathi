/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/PathSathi',
  assetPrefix: '/PathSathi',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: true
};

export default nextConfig;
