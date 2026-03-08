"use client";

import { linkDevice } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

type Step = "nickname" | "link";

export default function LinkSeniorPrompt({ onLinked }: { onLinked: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("nickname");
  const [nickname, setNickname] = useState("");

  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNicknameNext = () => {
    if (!nickname.trim()) return;
    setStep("link");
  };

  const handleLink = async (code: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await linkDevice(code.toUpperCase(), nickname.trim());
      onLinked();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.linkFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.length !== 6) return;
    handleLink(manualCode);
  };

  // Step 1: 닉네임 선택
  if (step === "nickname") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-20">
        <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mb-8 animate-[fadeUp_0.6s_ease-out_both]">
          <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>

        <h2 className="text-[22px] font-black text-stone-800 mb-8 animate-[fadeUp_0.6s_ease-out_0.4s_both]">
          {t.linkNicknameTitle}
        </h2>

        <input
          type="text"
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNicknameNext()}
          placeholder={t.linkNicknamePlaceholder}
          className="w-full max-w-[200px] pb-2 text-center text-[24px] font-bold bg-transparent border-b-2 border-stone-300 text-stone-800 outline-none focus:border-coral placeholder:text-stone-300 placeholder:font-light transition-colors animate-[fadeUp_0.6s_ease-out_0.8s_both]"
          autoFocus
        />

        <div className={`mt-10 transition-all duration-300 ${nickname.trim() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          <button
            onClick={handleNicknameNext}
            className="h-12 px-8 rounded-2xl bg-coral text-white font-bold pressable shadow-lg shadow-[#E8725C]/20"
          >
            {t.linkNext}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: 코드 입력으로 연결
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="w-20 h-20 rounded-full bg-[#E8725C]/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-[#E8725C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-stone-800 mb-1">
        <span className="text-coral">{nickname}</span> {t.linkConnect}
      </h2>

      <button
        onClick={() => setStep("nickname")}
        className="text-xs text-stone-400 underline underline-offset-4 mb-6"
      >
        {t.linkChangeNickname}
      </button>

      <p className="text-sm text-stone-400 text-center leading-relaxed mb-8">
        {t.linkCodeDesc.split("\n").map((line, i) => (
          <span key={i}>{i > 0 && <br />}{line.replace("{name}", nickname)}</span>
        ))}
      </p>

      <input
        type="text"
        maxLength={6}
        value={manualCode}
        onChange={(e) => setManualCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        placeholder="ABC123"
        className="w-full max-w-[240px] h-14 text-center text-2xl font-bold tracking-[0.3em] rounded-2xl bg-white border border-stone-200 text-stone-800 outline-none focus:ring-2 focus:ring-[#E8725C]/30 placeholder:text-2xl placeholder:tracking-[0.3em] placeholder:font-bold placeholder:text-stone-200"
        autoFocus
      />

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        onClick={handleManualSubmit}
        disabled={manualCode.length !== 6 || loading}
        className="mt-6 w-full max-w-[240px] h-12 rounded-2xl bg-coral text-white font-bold pressable disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t.linkConnecting}
          </span>
        ) : (
          t.linkConnect
        )}
      </button>

      <p className="mt-8 text-xs text-stone-300 text-center leading-relaxed">
        {t.linkCodeHint.split("\n").map((line, i) => (
          <span key={i}>{i > 0 && <br />}{line.replace("{name}", nickname)}</span>
        ))}
      </p>
    </div>
  );
}
