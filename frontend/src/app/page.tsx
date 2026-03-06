"use client";

import AppShell from "@/components/app-shell";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      router.push("/dashboard");
    } else {
      setIsLoggedIn(false);
    }
  }, [router]);

  if (isLoggedIn === null) return null;
  if (isLoggedIn) return null;

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <Image src="/logo.png" alt="hallmai" width={200} height={134} priority />
        <p className="text-stone-400 text-sm mt-1">AI가 챙기는 우리 부모님 안부</p>

        <div className="mt-12 flex flex-col gap-4 w-full max-w-[280px]">
          <Link
            href="/senior"
            className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-stone-200 pressable shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-bold text-stone-800">어르신 폰이에요</p>
              <p className="text-[12px] text-stone-400 mt-0.5">이 폰은 어르신이 쓸 거예요</p>
            </div>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-stone-200 pressable shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-bold text-stone-800">내 폰이에요</p>
              <p className="text-[12px] text-stone-400 mt-0.5">부모님 안부를 받고 싶어요</p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
