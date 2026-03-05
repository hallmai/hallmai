"use client";

import { useI18n } from "@/lib/i18n";

export interface CareCardProps {
  dateKey: string;
  mood: "good" | "okay" | "low";
  summaryKey: string;
  alertKeys?: string[];
  isLast?: boolean;
}

const moodColors = {
  good: "#34d399",
  okay: "#fbbf24",
  low: "#f87171",
};

export default function CareCard({ dateKey, mood, summaryKey, alertKeys, isLast }: CareCardProps) {
  const { t } = useI18n();

  const date = (t as Record<string, string>)[dateKey] || dateKey;
  const summary = (t as Record<string, string>)[summaryKey] || summaryKey;
  const alerts = alertKeys?.map((key) => (t as Record<string, string>)[key] || key);

  const moodConfig = {
    good: { emoji: "\u{1F60A}", label: t.moodGood },
    okay: { emoji: "\u{1F610}", label: t.moodOkay },
    low: { emoji: "\u{1F614}", label: t.moodLow },
  };

  const m = moodConfig[mood];

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1.5">
        <div
          className="w-3 h-3 rounded-full shrink-0 ring-4 ring-[#FFF8F0]"
          style={{ backgroundColor: moodColors[mood] }}
        />
        {!isLast && (
          <div className="w-[1.5px] flex-1 bg-stone-200 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-stone-400 font-medium">{date}</span>
          <span className="text-[11px] text-stone-500">
            {m.emoji} {m.label}
          </span>
        </div>

        <p className="text-[14px] leading-[1.7] text-stone-600">{summary}</p>

        {alerts && alerts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {alerts.map((alert) => (
              <span
                key={alert}
                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-500"
              >
                <span className="w-1 h-1 rounded-full bg-red-400" />
                {alert}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
