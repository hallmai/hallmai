import type { NextConfig } from "next";
import { execSync } from "child_process";

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is required");
}

function getBuildVersion(): string {
  let git = "unknown";
  try {
    git = execSync("git describe --tags --always", { encoding: "utf-8" }).trim().replace(/^v/, "");
  } catch {}
  const ts = new Date().toISOString().replace(/[-T:]/g, "").slice(4, 12);
  return `${git}(${ts})`;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getBuildVersion(),
  },
};

export default nextConfig;
