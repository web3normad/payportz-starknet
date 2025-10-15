import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // During Vercel builds we don't want TypeScript or ESLint failures
  // to block the deployment for this prototype branch. These flags
  // tell Next.js to ignore build-time type and lint errors.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
