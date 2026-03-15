"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Search, Youtube, Sun, Newspaper, Music, BookOpen, Dumbbell, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n, type DictionaryKey } from "@/lib/i18n";
import { useDevice } from "@/hooks/use-device";
import { useVoice } from "@/hooks/use-voice";
import { useCallState } from "@/contexts/call-state";
import { isTokenValid } from "@/lib/auth";

const subscribeAuth = () => () => {};
const getAuthSnapshot = () => isTokenValid();
const getServerAuthSnapshot = () => false;

const HOTKEYS: Array<{
  id: string;
  icon: LucideIcon;
  labelKey: DictionaryKey;
  descKey: DictionaryKey;
  enabled: boolean;
  prompt?: string;
}> = [
  { id: "search", icon: Search, labelKey: "hotkeySearch", descKey: "hotkeySearchDesc", enabled: true, prompt: "(검색 요청)" },
  { id: "youtube", icon: Youtube, labelKey: "hotkeyYoutube", descKey: "hotkeyYoutubeDesc", enabled: true, prompt: "(유튜브 검색 요청)" },
  { id: "weather", icon: Sun, labelKey: "hotkeyWeather", descKey: "hotkeyWeatherDesc", enabled: false },
  { id: "news", icon: Newspaper, labelKey: "hotkeyNews", descKey: "hotkeyNewsDesc", enabled: false },
  { id: "music", icon: Music, labelKey: "hotkeyMusic", descKey: "hotkeyMusicDesc", enabled: false },
  { id: "story", icon: BookOpen, labelKey: "hotkeyStory", descKey: "hotkeyStoryDesc", enabled: false },
  { id: "exercise", icon: Dumbbell, labelKey: "hotkeyExercise", descKey: "hotkeyExerciseDesc", enabled: false },
  { id: "help", icon: HelpCircle, labelKey: "hotkeyHelp", descKey: "hotkeyHelpDesc", enabled: false },
];

export default function CallPage() {
  const { t } = useI18n();
  const { deviceUuid, linkCode, linked, loading } = useDevice();
  const { state, error, silenceWarning, volumeRef, youtubeVideo, start, stop, interrupt, closeYoutube, triggerHotkey } = useVoice(deviceUuid);
  const { setCallActive } = useCallState();
  const [cycle, setCycle] = useState(0);
  const isLoggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef(0);

  const animateVolume = useCallback(() => {
    const btn = buttonRef.current;
    if (btn) {
      const v = volumeRef.current;
      const scale = 1.0 + v * 0.15;
      btn.style.transform = `scale(${scale})`;
    }
    rafRef.current = requestAnimationFrame(animateVolume);
  }, [volumeRef]);

  useEffect(() => {
    if (state === "listening" || state === "speaking") {
      rafRef.current = requestAnimationFrame(animateVolume);
    } else {
      cancelAnimationFrame(rafRef.current);
      if (buttonRef.current) {
        buttonRef.current.style.transform = "";
      }
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, animateVolume]);

  useEffect(() => {
    setCallActive(state !== "idle");
  }, [state, setCallActive]);

  const handleTap = () => {
    if (loading) return;
    if (state === "idle") {
      start();
    } else if (state === "speaking") {
      interrupt();
    } else if (state === "connecting" || state === "listening") {
      stop();
      setCycle((c) => c + 1);
    }
  };

  const isError = !!(error && state === "idle");

  const label = isError
    ? t.callError
    : silenceWarning && state === "listening"
      ? t.callSilenceWarning
      : {
          idle: t.callGreeting,
          connecting: t.callConnecting,
          listening: t.callListening,
          speaking: t.callSpeaking,
          ending: t.callEnding,
        }[state];

  const sublabel = isError
    ? t.callErrorRetry
    : {
        idle: t.callIdle,
        connecting: "",
        listening: "",
        speaking: "",
        ending: "",
      }[state];

  const isActive = state === "listening" || state === "speaking";
  const isIdle = state === "idle";
  const showLinkCode = !isLoggedIn && linkCode && !linked;
  const showSettingsButton = !isLoggedIn && isIdle && !isError;

  const buttonColor = isError
    ? "#ef4444"
    : state === "ending"
      ? "#34d399"
      : "#E8725C";

  return (
    <div className="relative flex flex-1 flex-col items-center">
      {/* Senior mode status indicator (top-right) */}
      {!isLoggedIn && !loading && (
        <span className="absolute top-2 right-5 text-[14px] font-mono font-bold text-stone-400 tracking-[0.15em]">
          {linked ? t.linkedFamily : linkCode}
        </span>
      )}

      {/* Hotkey grid — animates in/out */}
      <div
        className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
          isActive ? "max-h-[160px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="pt-12 px-4 grid grid-cols-4 gap-2">
          {HOTKEYS.map((hk) => (
            <button
              key={hk.id}
              disabled={!hk.enabled}
              onClick={() => hk.prompt && triggerHotkey(hk.prompt)}
              className={`pressable flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors ${
                hk.enabled
                  ? "text-[#E8725C] active:bg-[#E8725C]/10"
                  : "text-stone-300 opacity-40"
              }`}
            >
              <hk.icon className="w-5 h-5" strokeWidth={2} />
              <span className="text-[11px] font-semibold">{t[hk.labelKey]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Button + Label wrapper — centers in remaining space */}
      <div className="flex flex-1 flex-col items-center justify-center">

      {/* Main Button Area */}
      <div className="relative flex items-center justify-center">
        {/* Ripple rings */}
        {isActive && (
          <>
            <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-[#E8725C]/20 call-ripple" />
            <div
              className="absolute w-[200px] h-[200px] rounded-full border-2 border-[#E8725C]/20 call-ripple"
              style={{ animationDelay: "0.6s" }}
            />
            <div
              className="absolute w-[200px] h-[200px] rounded-full border-2 border-[#E8725C]/20 call-ripple"
              style={{ animationDelay: "1.2s" }}
            />
          </>
        )}

        {/* Idle / Connecting breathing glow */}
        {(state === "idle" || state === "connecting") && !isError && (
          <div key={`breathe-${cycle}`}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-[#E8725C]/[0.06] call-breathe" />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-[#E8725C]/[0.04] call-breathe"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#E8725C]/[0.02] call-breathe"
              style={{ animationDelay: "1s" }}
            />
          </div>
        )}

        {/* Button */}
        <button
          ref={buttonRef}
          onClick={handleTap}
          disabled={loading}
          className="pressable relative z-10 w-[180px] h-[180px] rounded-full flex items-center justify-center shadow-2xl shadow-[#E8725C]/25 transition-[background-color] duration-300 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#E8725C]/50"
          style={{
            backgroundColor: buttonColor,
            transform: isActive ? undefined : "scale(1)",
          }}
        >
          {isError && (
            <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}

          {!isError && (state === "idle" || state === "connecting") && (
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
            </svg>
          )}

          {state === "listening" && (
            <div className="flex items-center gap-[4px]">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-[5px] rounded-full bg-white call-wave-bar"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}

          {state === "speaking" && (
            <div className="flex items-center gap-[4px]">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-[5px] rounded-full bg-white call-wave-bar-slow"
                  style={{
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
          )}

          {state === "ending" && (
            <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Label */}
      <div className="mt-14 min-h-[88px] text-center transition-all duration-500">
        <p
          className="text-[32px] font-bold italic tracking-tight leading-tight"
          style={{
            color: isError ? "#ef4444" : state === "ending" ? "#34d399" : "#44403c",
          }}
        >
          &ldquo; {label} &rdquo;
        </p>
        {sublabel && (
          <p className="mt-3 text-[20px] text-stone-400 font-semibold">
            {sublabel}
          </p>
        )}
      </div>

      </div>{/* End Button + Label wrapper */}

      {/* Settings — senior mode only, bottom right, hidden during call */}
      {showSettingsButton && (
        <Link
          href="/settings"
          className="absolute bottom-5 right-5 w-8 h-8 flex items-center justify-center rounded-full"
        >
          <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      )}

      {/* YouTube player overlay */}
      {youtubeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
          <div className="w-full max-w-[430px] px-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={closeYoutube}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white text-xl"
                aria-label="Close video"
              >
                &#x2715;
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${youtubeVideo.videoId}?autoplay=1`}
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="autoplay; encrypted-media"
                title={youtubeVideo.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
