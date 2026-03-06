"use client";

import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppShell from "./app-shell";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, locale, toggleLocale } = useI18n();
  const pathname = usePathname();
  const isSettings = pathname === "/settings";

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 h-12 bg-[#FFF8F0]/80 backdrop-blur-xl">
        <Image src="/logo.png" alt={t.brand} width={72} height={35} priority />
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLocale}
            className="pressable h-8 px-2.5 rounded-full text-[11px] font-semibold text-stone-400 transition-colors hover:bg-stone-100"
          >
            {locale === "ko" ? "EN" : "KO"}
          </button>
          <button className="pressable w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        {children}
      </main>

      {/* Floating Tab Bar */}
      <div className="absolute bottom-5 left-5 right-5 z-50">
        <nav className="flex rounded-2xl bg-[#FFF8F0]/80 backdrop-blur-xl shadow-lg shadow-stone-900/[0.08] border border-stone-200/40">
          <Link href="/dashboard" className="flex-1 flex flex-col items-center gap-0.5 py-3">
            <svg className={`w-5 h-5 ${!isSettings ? "text-[#E8725C]" : "text-stone-300"}`} fill={!isSettings ? "currentColor" : "none"} viewBox="0 0 24 24" stroke={isSettings ? "currentColor" : undefined} strokeWidth={isSettings ? 2 : undefined}>
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className={`text-[10px] font-semibold ${!isSettings ? "text-[#E8725C]" : "text-stone-300"}`}>{t.updatesTab}</span>
          </Link>
          <Link href="/settings" className="flex-1 flex flex-col items-center gap-0.5 py-3">
            <svg className={`w-5 h-5 ${isSettings ? "text-[#E8725C]" : "text-stone-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-[10px] font-medium ${isSettings ? "text-[#E8725C]" : "text-stone-300"}`}>{t.settingsTab}</span>
          </Link>
        </nav>
      </div>
    </AppShell>
  );
}
