import type { NextConfig } from "next";

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is required");
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
