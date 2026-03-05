"use client";

import DownloadSidebar from "./download-sidebar";

export default function PhoneFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh justify-center" style={{ background: "#F0E8DF" }}>
      <div
        className="relative flex w-full max-w-md flex-col min-h-dvh overflow-x-hidden"
        style={{ background: "#FFF7EE" }}
      >
        {children}
      </div>
      <DownloadSidebar />
    </div>
  );
}
