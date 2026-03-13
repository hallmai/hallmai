"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SafeArea } from "capacitor-plugin-safe-area";
import { StatusBar, Style } from "@capacitor/status-bar";

export default function DeviceProvider() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    SafeArea.getSafeAreaInsets()
      .then(({ insets }) => {
        const style = document.documentElement.style;
        style.setProperty("--safe-area-inset-top", `${insets.top}px`);
        style.setProperty("--safe-area-inset-bottom", `${insets.bottom}px`);
        style.setProperty("--safe-area-inset-left", `${insets.left}px`);
        style.setProperty("--safe-area-inset-right", `${insets.right}px`);
      })
      .catch(console.error);

    StatusBar.setStyle({ style: Style.Light }).catch(console.error);
    StatusBar.setBackgroundColor({ color: "#FFF8F0" }).catch(console.error);
  }, []);

  return null;
}
