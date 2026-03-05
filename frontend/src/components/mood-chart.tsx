"use client";

import { useI18n } from "@/lib/i18n";

const colors = {
  good: "#34d399",
  okay: "#fbbf24",
  low: "#f87171",
};

const MAX_H = 64;

export default function MoodChart() {
  const { t } = useI18n();

  const days = [
    { day: t.dayMon, score: 0.8, level: "good" as const },
    { day: t.dayTue, score: 0.55, level: "okay" as const },
    { day: t.dayWed, score: 0.9, level: "good" as const },
    { day: t.dayThu, score: 0.35, level: "low" as const },
    { day: t.dayFri, score: 0.75, level: "good" as const },
    { day: t.daySat, score: 0.5, level: "okay" as const },
    { day: t.daySun, score: 0.85, level: "good" as const, today: true },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-[15px] font-bold text-stone-800 tracking-tight">
          {t.weeklyMood}
        </h3>
        <span className="text-[11px] text-stone-400">{t.weeklyMoodRange}</span>
      </div>

      <div className="flex items-end justify-between gap-4 px-2" style={{ height: MAX_H + 24 }}>
        {days.map((d, i) => {
          const h = Math.max(d.score * MAX_H, 12);
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[28px]">
              <div
                className="w-3 rounded-full transition-all duration-300"
                style={{
                  height: h,
                  backgroundColor: colors[d.level],
                  boxShadow: d.today ? `0 0 8px ${colors[d.level]}60` : "none",
                }}
              />
              <span className={`text-[10px] font-medium ${d.today ? "text-stone-700" : "text-stone-400"}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-stone-100/50">
        {(["good", "okay", "low"] as const).map((level) => (
          <span key={level} className="flex items-center gap-1.5 text-[10px] text-stone-400 font-medium">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors[level] }}
            />
            {level === "good" ? t.moodGood : level === "okay" ? t.moodOkay : t.moodLow}
          </span>
        ))}
      </div>
    </div>
  );
}
