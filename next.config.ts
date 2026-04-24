import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['10.125.220.67', '45a8-2c0f-f5c0-b02-189a-d99d-1958-83dd-1886.ngrok-free.app'],
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
