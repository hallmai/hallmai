"use client";

// Demo: 데모 영상용 피드 카드 컴포넌트들 (AlertCard, VoiceSummaryCard, StatsCard, MoodChartCard, WeeklyInsightCard)

import { useState, useRef, useEffect, useMemo } from "react";

/* ── Alert Card ── */
export function AlertCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-emerald-50 border border-emerald-100/60 px-4 py-3.5 flex items-center gap-3">
      <div className="shrink-0 relative flex items-center justify-center w-8 h-8">
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <div
          className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-emerald-700">{title}</p>
        <p className="text-[11px] text-emerald-500 mt-0.5">{detail}</p>
      </div>
      <svg className="shrink-0 w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

/* ── Voice Summary Card ── */
export function VoiceSummaryCard({
  title,
  duration,
  preview,
}: {
  title: string;
  duration: string;
  preview: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        progressRef.current += 0.5;
        if (progressRef.current >= 100) {
          progressRef.current = 0;
          setProgress(0);
          setPlaying(false);
        } else {
          setProgress(progressRef.current);
        }
      }, 50);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const bars = 40;
  const barHeights = useMemo(
    () => Array.from({ length: bars }, (_, i) => 15 + (Math.sin(i * 1.2 + 0.5) * 0.5 + 0.5) * 85),
    [],
  );

  return (
    <div className="rounded-2xl bg-gradient-to-br from-stone-800 via-stone-800 to-stone-900 p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-3.5 h-3.5 text-[#E8725C]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
        </svg>
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
          Voice Summary
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-[20px] font-bold text-white tracking-tight">{title}</h3>
        <span className="text-[12px] text-stone-500 font-mono">{duration}</span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => setPlaying(!playing)}
          className="pressable shrink-0 w-12 h-12 rounded-full bg-[#E8725C] flex items-center justify-center shadow-lg shadow-[#E8725C]/20"
        >
          {playing ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1 flex items-center gap-[1.5px] h-12">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h}%`,
                backgroundColor: (i / bars) * 100 <= progress ? "#E8725C" : "#44403c",
                transition: "background-color 0.15s",
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-stone-500 line-clamp-2">{preview}</p>
    </div>
  );
}

/* ── Stats Card ── */
export function StatsCard({
  stats,
}: {
  stats: { value: string; unit: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border border-stone-100 px-3 py-4 text-center">
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

/* ── Mood Chart Card ── */
const moodColors = { good: "#34d399", okay: "#fbbf24", low: "#f87171" };

export function MoodChartCard({
  days,
  dateRange = "",
}: {
  days: { day: string; score: number; level: "good" | "okay" | "low"; today?: boolean }[];
  dateRange?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-[15px] font-bold text-stone-800 tracking-tight">Weekly Mood</h3>
        {dateRange && <span className="text-[11px] text-stone-400">{dateRange}</span>}
      </div>

      <div className="flex items-end justify-between gap-4 px-2" style={{ height: 88 }}>
        {days.map((d, i) => {
          const h = Math.max(d.score * 64, 12);
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[28px]">
              <div
                className="w-3 rounded-full transition-all duration-300"
                style={{
                  height: h,
                  backgroundColor: moodColors[d.level],
                  boxShadow: d.today ? `0 0 8px ${moodColors[d.level]}60` : "none",
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
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: moodColors[level] }} />
            {level === "good" ? "Warm" : level === "okay" ? "Calm" : "Quiet"}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Weekly Insight Card ── */
export function WeeklyInsightCard({
  text,
  tags,
}: {
  text: string;
  tags: string[];
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#E8725C] via-[#e06a52] to-[#cf5a44] p-6 text-white relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.06]" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/[0.04]" />

      <div className="relative">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight">Weekly Insight</h3>
          <span className="text-[10px] opacity-40">by AI</span>
        </div>
        <p className="text-[14px] leading-[1.7] opacity-90">{text}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
