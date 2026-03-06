"use client";

import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { clearAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { t, locale, toggleLocale } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; profileImage?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

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

          {/* Nickname */}
          <div className="card p-4">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              {t.settingsNickname}
            </label>
            <p className="text-[11px] text-stone-400 mt-0.5">{t.settingsNicknameDesc}</p>
            <input
              type="text"
              defaultValue={t.callNickname}
              className="mt-2 w-full h-10 px-3 rounded-xl bg-stone-100 text-[15px] text-stone-800 font-medium outline-none focus:ring-2 focus:ring-[#E8725C]/30"
            />
          </div>

          {/* Tone */}
          <div className="card p-4">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              {t.settingsTone}
            </label>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-[#E8725C] px-4 py-2 text-[13px] text-white font-medium">
                {t.settingsToneWarm}
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div className="card p-4">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              {t.settingsSchedule}
            </label>
            <input
              type="time"
              defaultValue="14:00"
              className="mt-2 w-full h-10 px-3 rounded-xl bg-stone-100 text-[15px] text-stone-800 font-medium outline-none focus:ring-2 focus:ring-[#E8725C]/30"
            />
          </div>

          {/* Family Link */}
          <div className="card p-4">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              {t.settingsFamily}
            </label>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-10 px-3 rounded-xl bg-stone-100 flex items-center">
                <span className="text-[13px] text-stone-500 truncate">hallmai.app/family/abc123</span>
              </div>
              <button className="pressable shrink-0 h-10 px-4 rounded-xl bg-[#E8725C] text-[13px] text-white font-medium">
                {t.settingsFamilyCopy}
              </button>
            </div>
          </div>

          {/* Legal Links */}
          <div className="card overflow-hidden">
            <Link href="/terms" className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
              <span className="text-[14px] text-stone-700">서비스 이용약관</span>
              <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/privacy" className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
              <span className="text-[14px] text-stone-700">개인정보 처리방침</span>
              <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/marketing-terms" className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[14px] text-stone-700">마케팅 수신 동의</span>
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
            로그아웃
          </button>
        </div>
      </div>
    </AppShell>
  );
}
