import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hallmai.app",
  appName: "hallmai",
  webDir: "out",
  server: {
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: true,
  },
};

export default config;
