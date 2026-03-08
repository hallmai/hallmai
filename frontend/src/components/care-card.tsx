"use client";

import { useI18n } from "@/lib/i18n";

export interface CareCardProps {
  date: string;
  mood: "good" | "okay" | "low";
  summary: string;
  quote?: string;
  isLast?: boolean;
}

const moodColors = {
  good: "#34d399",
  okay: "#fbbf24",
  low: "#f87171",
};

export default function CareCard({ date, mood, summary, quote, isLast }: CareCardProps) {
  const { t } = useI18n();

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

        {quote && (
          <p className="mt-2 text-[13px] leading-[1.6] text-stone-400 italic border-l-2 border-stone-200 pl-3">
            &ldquo;{quote}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
