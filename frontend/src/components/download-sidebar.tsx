"use client";

import { useEffect, useState } from "react";

export default function DownloadSidebar() {
  const [isNative, setIsNative] = useState(true);

  useEffect(() => {
    import("@/lib/platform").then(({ isNativePlatform }) => {
      setIsNative(isNativePlatform());
    });
  }, []);

  if (isNative) return null;

  return (
    <aside className="hidden lg:flex flex-col items-center justify-center w-80 shrink-0 p-8">
      <div className="text-center space-y-6">
        <h2 className="text-xl font-bold">Download the App</h2>
        <p className="text-sm text-gray-500">
          Get the full experience on your mobile device.
        </p>

        <div className="space-y-3">
          <a
            href="#"
            className="block w-full rounded-lg bg-black text-white py-3 px-6 text-center text-sm font-medium"
          >
            App Store
          </a>
          <a
            href="#"
            className="block w-full rounded-lg bg-black text-white py-3 px-6 text-center text-sm font-medium"
          >
            Google Play
          </a>
        </div>
      </div>
    </aside>
  );
}
