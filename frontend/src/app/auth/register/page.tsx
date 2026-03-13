"use client";

import AppShell from "@/components/app-shell";
import { apiGoogleRegister, saveAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { DictionaryKey } from "@/lib/i18n";

interface AgreementItem {
  key: string;
  labelKey: DictionaryKey;
  required: boolean;
  href: string;
}

const AGREEMENTS: AgreementItem[] = [
  { key: "terms", labelKey: "settingsTerms", required: true, href: "/terms" },
  { key: "privacy", labelKey: "settingsPrivacy", required: true, href: "/privacy" },
  { key: "marketing", labelKey: "settingsMarketing", required: false, href: "/marketing-terms" },
];

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("pendingRegistrationToken");
  });

  useEffect(() => {
    if (!pendingToken) {
      router.replace("/login");
    }
  }, [pendingToken, router]);

  const allChecked = AGREEMENTS.every((a) => checked[a.key]);
  const requiredChecked = AGREEMENTS.filter((a) => a.required).every((a) => checked[a.key]);

  const toggleAll = useCallback(() => {
    const next = !allChecked;
    const newChecked: Record<string, boolean> = {};
    for (const a of AGREEMENTS) newChecked[a.key] = next;
    setChecked(newChecked);
  }, [allChecked]);

  const toggle = useCallback((key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSubmit = async () => {
    if (!requiredChecked || isSubmitting || !pendingToken) return;
    setIsSubmitting(true);
    try {
      const result = await apiGoogleRegister(pendingToken, !!checked["marketing"]);
      saveAuth(result);
      sessionStorage.removeItem("pendingRegistrationToken");
      router.replace("/stories");
    } catch {
      setIsSubmitting(false);
    }
  };

  if (!pendingToken) return null;

  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex w-full max-w-sm flex-col items-center px-8 py-16">
          <Image src="/logo.png" alt="hallmai" width={120} height={80} className="mb-6" />
          <h1 className="text-xl font-bold text-stone-800">{t.registerTitle}</h1>
          <p className="mt-2 text-sm text-stone-400">{t.registerSubtitle}</p>

          {/* 전체 동의 */}
          <button
            onClick={toggleAll}
            className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5"
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                allChecked ? "border-[#E8725C] bg-[#E8725C]" : "border-stone-300"
              }`}
            >
              {allChecked && (
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-sm font-semibold text-stone-800">{t.registerAgreeAll}</span>
          </button>

          {/* 개별 약관 */}
          <div className="mt-3 w-full space-y-1">
            {AGREEMENTS.map((a) => (
              <div key={a.key}>
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <button onClick={() => toggle(a.key)} className="flex items-center gap-3">
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        checked[a.key] ? "border-[#E8725C] bg-[#E8725C]" : "border-stone-300"
                      }`}
                    >
                      {checked[a.key] && (
                        <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-stone-600">
                      {t[a.labelKey]}
                      <span className={a.required ? "ml-1 text-[#E8725C]" : "ml-1 text-stone-400"}>
                        ({a.required ? t.registerRequired : t.registerOptional})
                      </span>
                    </span>
                  </button>
                  <Link href={a.href} className="ml-auto text-stone-400 active:text-stone-600">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                {a.key === "marketing" && (
                  <p className="px-4 pl-12 text-xs leading-relaxed text-stone-400">
                    {t.registerMarketingDesc}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 가입 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!requiredChecked || isSubmitting}
            className="mt-8 h-12 w-full rounded-2xl bg-coral text-base font-bold text-white pressable disabled:opacity-40"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {t.registerSubmitting}
              </span>
            ) : (
              t.registerSubmit
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
