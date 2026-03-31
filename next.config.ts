import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['10.192.49.56'],
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
