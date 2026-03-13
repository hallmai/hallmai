"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function FamilyTabs() {
  const { t } = useI18n();
  const pathname = usePathname();

  const tabs = [
    {
      href: "/call",
      label: t.tabCall,
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? "text-[#E8725C]" : "text-stone-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      href: "/stories",
      label: t.tabStories,
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? "text-[#E8725C]" : "text-stone-300"}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke={active ? undefined : "currentColor"} strokeWidth={active ? undefined : 2}>
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: t.tabSettings,
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? "text-[#E8725C]" : "text-stone-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="absolute bottom-5 pb-safe left-5 right-5 z-50">
      <nav className="flex rounded-2xl bg-[#FFF8F0]/80 backdrop-blur-xl shadow-lg shadow-stone-900/[0.08] border border-stone-200/40">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center gap-0.5 py-3">
              {tab.icon(isActive)}
              <span className={`text-[10px] font-semibold ${isActive ? "text-[#E8725C]" : "text-stone-300"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
