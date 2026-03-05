"use client";

import DownloadSidebar from "./download-sidebar";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh justify-center">
      <div className="relative flex w-full max-w-lg flex-col h-dvh">
        <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4">
          <span className="font-bold text-lg">hallmai</span>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </div>

        <nav className="shrink-0 border-t flex justify-around py-3">
          <span className="text-xs">Home</span>
          <span className="text-xs">Search</span>
          <span className="text-xs">My</span>
        </nav>
      </div>

      <DownloadSidebar />
    </div>
  );
}
