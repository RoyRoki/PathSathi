/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/PathSathi' : '',
  assetPrefix: isProd ? '/PathSathi' : '',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: true
};

export default nextConfig;
