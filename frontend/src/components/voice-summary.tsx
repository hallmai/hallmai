"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export default function VoiceSummary() {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 50);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const bars = 40;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-stone-800 via-stone-800 to-stone-900 p-5 overflow-hidden">
      {/* Label */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-3.5 h-3.5 text-[#E8725C]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
        </svg>
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
          {t.voiceSummaryLabel}
        </span>
      </div>

      {/* Title + Duration */}
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-[20px] font-bold text-white tracking-tight">
          {t.voiceSummaryTitle}
        </h3>
        <span className="text-[12px] text-stone-500 font-mono">
          {t.voiceSummaryDuration}
        </span>
      </div>

      {/* Player */}
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => setPlaying(!playing)}
          className="pressable shrink-0 w-12 h-12 rounded-full bg-[#E8725C] flex items-center justify-center shadow-lg shadow-[#E8725C]/20"
        >
          {playing ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <div className="flex-1 flex items-center gap-[1.5px] h-12">
          {Array.from({ length: bars }, (_, i) => {
            const seed = Math.sin(i * 1.2 + 0.5) * 0.5 + 0.5;
            const h = 15 + seed * 85;
            const filled = (i / bars) * 100 <= progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-full"
                style={{
                  height: `${h}%`,
                  backgroundColor: filled ? "#E8725C" : "#44403c",
                  transition: "background-color 0.15s",
                  animation: playing && filled ? `waveform ${0.5 + seed * 0.7}s ease-in-out infinite` : "none",
                  animationDelay: `${i * 25}ms`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <p className="text-[13px] leading-relaxed text-stone-500 line-clamp-2">
        {t.voiceSummaryPreview}
      </p>
    </div>
  );
}
