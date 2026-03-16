import type { NextConfig } from "next";
import { execSync } from "child_process";

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is required");
}

function getBuildVersion(): string {
  let git = "unknown";
  try {
    git = execSync("git describe --tags --always", { encoding: "utf-8" })
      .trim()
      .replace(/^v/, "")
      .replace(/-\d+-g[a-f0-9]+$/, ""); // 태그 외 커밋 suffix 제거
  } catch {}
  return git;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getBuildVersion(),
  },
};

export default nextConfig;
