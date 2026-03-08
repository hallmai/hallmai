"use client";

import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { clearAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

function getUserSnapshot(): { name: string; email: string; profileImage?: string } | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

const subscribeUser = () => () => {};
const getServerUser = () => null;

export default function SettingsPage() {
  const { t, locale, toggleLocale } = useI18n();
  const router = useRouter();
  const user = useSyncExternalStore(subscribeUser, getUserSnapshot, getServerUser);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-stone-200/40">
        <Link href="/dashboard" className="text-[14px] text-[#E8725C] font-medium">
          &larr; {t.settingsBack}
        </Link>
        <span className="text-[16px] font-bold text-stone-800">{t.settingsTitle}</span>
        <button
          onClick={toggleLocale}
          className="text-[12px] font-semibold text-stone-400"
        >
          {locale === "ko" ? "EN" : "KO"}
        </button>
      </header>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-12">
        <div className="space-y-4">
          {/* Profile */}
          {user && (
            <div className="card p-4 flex items-center gap-3">
              {user.profileImage ? (
                <img src={user.profileImage} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-[15px] font-semibold text-stone-800">{user.name}</p>
                <p className="text-[12px] text-stone-400">{user.email}</p>
              </div>
            </div>
          )}

          {/* Legal Links */}
          <div className="card overflow-hidden">
            <Link href="/terms" className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
              <span className="text-[14px] text-stone-700">{t.settingsTerms}</span>
              <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/privacy" className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
              <span className="text-[14px] text-stone-700">{t.settingsPrivacy}</span>
              <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/marketing-terms" className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[14px] text-stone-700">{t.settingsMarketing}</span>
              <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-2xl border border-stone-200 text-[14px] font-semibold text-stone-500 pressable"
          >
            {t.settingsLogout}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
