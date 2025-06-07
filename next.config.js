/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignores ESLint errors during `next build`
  },
  typescript: {
    ignoreBuildErrors: true,  // ✅ Ignores TypeScript type errors during `next build`
  },
  webpack: (config) => {
    config.cache = false;     // ✅ Disables Webpack caching (for clean builds)

    // ✅ Add alias to support "@/..." imports during build
    config.resolve.alias['@'] = path.resolve(__dirname);

    return config;
  },
};

module.exports = nextConfig;
