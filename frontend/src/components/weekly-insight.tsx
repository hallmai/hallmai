"use client";

import { useI18n } from "@/lib/i18n";

export default function WeeklyInsight() {
  const { t } = useI18n();

  const tags = [t.tagActive, t.tagLoneliness, t.tagAppetite];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#E8725C] via-[#e06a52] to-[#cf5a44] p-6 text-white relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.06]" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/[0.04]" />

      <div className="relative">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight">{t.weeklyInsight}</h3>
          <span className="text-[10px] opacity-40">{t.weeklyInsightBy}</span>
        </div>
        <p className="text-[14px] leading-[1.7] opacity-90">
          {t.weeklyInsightText}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
