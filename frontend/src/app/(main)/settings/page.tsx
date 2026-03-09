"use client";

import { useI18n } from "@/lib/i18n";
import { apiGoogleLogin, clearAuth, saveAuth } from "@/lib/auth";
import { useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

type UserSnapshot = { name: string; email: string; profileImage?: string } | null;
let cachedRaw: string | null = null;
let cachedUser: UserSnapshot = null;

function getUserSnapshot(): UserSnapshot {
  const raw = localStorage.getItem("user");
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  if (!raw) { cachedUser = null; return null; }
  try {
    cachedUser = JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    cachedUser = null;
  }
  return cachedUser;
}

const subscribeUser = (cb: () => void) => {
  const handler = (e: StorageEvent) => { if (e.key === "user") cb(); };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};
const getServerUser = (): UserSnapshot => null;

export default function SettingsPage() {
  const { t, locale, toggleLocale } = useI18n();
  const router = useRouter();
  const user = useSyncExternalStore(subscribeUser, getUserSnapshot, getServerUser);

  const handleLogout = () => {
    clearAuth();
    router.replace("/call");
  };

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-stone-200/40">
        {user ? (
          <div className="w-14" />
        ) : (
          <Link href="/call" className="text-[14px] text-[#E8725C] font-medium">
            &larr; {t.settingsBack}
          </Link>
        )}
        <span className="text-[16px] font-bold text-stone-800">{t.settingsTitle}</span>
        <button
          onClick={toggleLocale}
          className="text-[12px] font-semibold text-stone-400"
        >
          {locale === "ko" ? "EN" : "KO"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24">
        <div className="space-y-4">
          {user ? (
            <LoggedInSettings user={user} t={t} onLogout={handleLogout} />
          ) : (
            <GuestSettings t={t} router={router} />
          )}
        </div>
      </div>
    </>
  );
}

function LoggedInSettings({
  user,
  t,
  onLogout,
}: {
  user: { name: string; email: string; profileImage?: string };
  t: ReturnType<typeof useI18n>["t"];
  onLogout: () => void;
}) {
  return (
    <>
      {/* Profile */}
      <div className="card p-4 flex items-center gap-3">
        {user.profileImage ? (
          <img src={user.profileImage} alt="" width={40} height={40} className="rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div>
          <p className="text-[15px] font-semibold text-stone-800">{user.name}</p>
          <p className="text-[12px] text-stone-400">{user.email}</p>
        </div>
      </div>

      {/* Legal Links */}
      <LegalLinks t={t} />

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl border border-stone-200 text-[14px] font-semibold text-stone-500 pressable"
      >
        {t.settingsLogout}
      </button>
    </>
  );
}

function GuestSettings({
  t,
  router,
}: {
  t: ReturnType<typeof useI18n>["t"];
  router: ReturnType<typeof useRouter>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "popup",
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiGoogleLogin(codeResponse.code);

        if (!result.registered) {
          sessionStorage.setItem("pendingGoogleIdToken", result.idToken);
          router.push("/auth/register");
          return;
        }

        saveAuth(result);
        router.push("/stories");
      } catch {
        setError(t.linkFailed);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError(t.linkFailed);
    },
  });

  return (
    <>
      {/* Login prompt */}
      <div className="card p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-[16px] font-bold text-stone-800">{t.settingsLoginTitle}</h2>
        <p className="mt-2 text-[13px] text-stone-400 leading-relaxed">{t.settingsLoginDesc}</p>

        <button
          onClick={() => login()}
          disabled={loading}
          className="mt-5 flex items-center gap-3 px-6 py-3.5 bg-white rounded-2xl border border-stone-200 shadow-sm pressable w-full max-w-[280px] justify-center disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-semibold text-stone-700">
            {loading ? t.settingsLoginLoading : t.settingsLoginButton}
          </span>
        </button>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      {/* Legal Links */}
      <LegalLinks t={t} />
    </>
  );
}

function LegalLinks({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <div className="card overflow-hidden">
      <Link href="/terms" className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
        <span className="text-[14px] text-stone-700">{t.settingsTerms}</span>
        <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <Link href="/privacy" className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
        <span className="text-[14px] text-stone-700">{t.settingsPrivacy}</span>
        <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <Link href="/marketing-terms" className="flex items-center justify-between px-4 py-3.5">
        <span className="text-[14px] text-stone-700">{t.settingsMarketing}</span>
        <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
