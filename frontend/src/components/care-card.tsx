"use client";

export interface CareCardProps {
  date: string;
  mood: "good" | "okay" | "low";
  moodLabel: string;
  summary: string;
  quote?: string;
  cardType?: "daily" | "health" | "memory" | "social" | "mood-alert";
}

const moodConfig = {
  good: { emoji: "\u{1F60A}", border: "border-l-emerald-400" },
  okay: { emoji: "\u{1F610}", border: "border-l-amber-400" },
  low: { emoji: "\u{1F614}", border: "border-l-red-400" },
};

const cardTypeConfig = {
  daily: { icon: "\u{1F4AC}", label: "Daily Chat" },
  health: { icon: "\u{1F49A}", label: "Health" },
  memory: { icon: "\u{1F4F8}", label: "Memory" },
  social: { icon: "\u{1F91D}", label: "Social" },
  "mood-alert": { icon: "\u{1F514}", label: "Check-in" },
};

export default function CareCard({ date, mood, moodLabel, summary, quote, cardType = "daily" }: CareCardProps) {
  const m = moodConfig[mood];
  const ct = cardTypeConfig[cardType];

  return (
    <div
      className={`bg-white rounded-2xl border border-stone-100 border-l-[3px] ${m.border} px-4 py-4`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
            {ct.icon} {ct.label}
          </span>
          <span className="text-[12px] text-stone-400 font-medium">{date}</span>
        </div>
        <span className="text-[12px] text-stone-500">
          {m.emoji} {moodLabel}
        </span>
      </div>

      <p className="text-[14px] leading-[1.7] text-stone-700">{summary}</p>

      {quote && (
        <p className="mt-2.5 text-[13px] leading-[1.6] text-stone-400 italic border-l-2 border-stone-200 pl-3">
          &ldquo;{quote}&rdquo;
        </p>
      )}
    </div>
  );
}
