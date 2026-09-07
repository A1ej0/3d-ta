import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Transpile Three.js packages for proper ESM handling
  transpilePackages: ["three"],
  // Evitar que Next.js intente empaquetar dependencias pesadas de servidor
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
