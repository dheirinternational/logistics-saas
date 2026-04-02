import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['10.204.0.56'],
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      }
    ],
  },
};

export default nextConfig;
