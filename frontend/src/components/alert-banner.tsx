"use client";

import { useI18n } from "@/lib/i18n";

export default function AlertBanner() {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl bg-red-50 border border-red-100/60 px-4 py-3.5 flex items-center gap-3">
      <div className="shrink-0 relative flex items-center justify-center w-8 h-8">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div
          className="absolute w-3 h-3 rounded-full bg-red-400"
          style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-red-700">{t.alertSleep}</p>
        <p className="text-[11px] text-red-500 mt-0.5">{t.alertSleepDetail}</p>
      </div>
      <svg className="shrink-0 w-4 h-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
