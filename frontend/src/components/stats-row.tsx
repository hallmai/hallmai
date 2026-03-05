"use client";

import { useI18n } from "@/lib/i18n";

export default function StatsRow() {
  const { t } = useI18n();

  const stats = [
    { value: "12", unit: t.statStreakUnit, label: t.statStreak },
    { value: "6", unit: t.statWeekUnit, label: t.statWeek },
    { value: "\u{1F60A}", unit: t.statMoodUnit, label: t.statMood },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="card px-3 py-4 text-center">
          <p className="text-[28px] font-black text-stone-800 tracking-tighter leading-none">
            {s.value}
          </p>
          <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wider">
            {s.unit} &middot; {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
