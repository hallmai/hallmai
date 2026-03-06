"use client";

import DownloadSidebar from "./download-sidebar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh justify-center bg-[#f2f1ef]">
      <div className="relative flex w-full max-w-[430px] flex-col h-dvh bg-[#FFF8F0]">
        {children}
      </div>
      <DownloadSidebar />
    </div>
  );
}
