import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hallmai.app",
  appName: "hallmai",
  webDir: "out",
  server: {
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: true,
    allowNavigation: ["*"],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      androidScaleType: "FIT_XY",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
    },
    Keyboard: {
      resize: "native",
    },
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#FFF8F0",
    zoomEnabled: false,
  },
  android: {
    backgroundColor: "#FFF8F0",
  },
};

export default config;
