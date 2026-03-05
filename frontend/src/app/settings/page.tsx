"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function SettingsPage() {
  const { t, locale, toggleLocale } = useI18n();

  return (
    <div className="flex h-dvh justify-center bg-[#f2f1ef]">
      <div className="relative flex w-full max-w-[430px] flex-col h-dvh bg-[#FFF8F0]">
        {/* Header */}
        <header className="flex items-center justify-between px-5 h-14 border-b border-stone-200/40">
          <Link href="/call" className="text-[14px] text-[#E8725C] font-medium">
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
          </div>
        </div>
      </div>
    </div>
  );
}
