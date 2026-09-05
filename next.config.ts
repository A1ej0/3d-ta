import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Transpile Three.js packages for proper ESM handling
  transpilePackages: ["three"],
};

export default nextConfig;
