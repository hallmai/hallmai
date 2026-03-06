"use client";

import AppShell from "@/components/app-shell";
import { SoundTransmitter } from "@/lib/sound-transfer";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";

export default function SeniorPage() {
  const [code, setCode] = useState<string | null>(null);
  const [transmitting, setTransmitting] = useState(false);
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const transmitterRef = useRef<SoundTransmitter | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let deviceId = localStorage.getItem("seniorDeviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("seniorDeviceId", deviceId);
    }

    fetch(`${API_URL}/api/device/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    })
      .then((res) => res.json())
      .then((data) => {
        const d = data.data;
        if (d?.linked) {
          setLinked(true);
        } else if (d?.code) {
          setCode(d.code);
          startPolling(d.code);
        }
        setLoading(false);
      });

    return () => {
      transmitterRef.current?.stop();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (linkCode: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/device/status/${linkCode}`);
        const data = await res.json();
        if (data.data?.linked) {
          setLinked(true);
          transmitterRef.current?.stop();
          setTransmitting(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch { /* ignore */ }
    }, 2000);
  };

  const handleStartTransmit = () => {
    if (!code) return;
    const t = new SoundTransmitter();
    transmitterRef.current = t;
    t.start(code);
    setTransmitting(true);
  };

  const handleStopTransmit = () => {
    transmitterRef.current?.stop();
    setTransmitting(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-[#E8725C] border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (linked) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">연결 완료!</h2>
          <p className="text-sm text-stone-400 text-center">
            가족과 연결되었습니다.<br />이제 AI와 대화할 수 있어요.
          </p>
          <a
            href="/call"
            className="mt-8 h-12 px-8 rounded-2xl bg-coral text-white font-bold pressable flex items-center justify-center"
          >
            대화 시작하기
          </a>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* 아이콘 */}
        <div className="w-20 h-20 rounded-full bg-[#E8725C]/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#E8725C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-stone-800 mb-2">가족 연결하기</h2>
        <p className="text-sm text-stone-400 text-center leading-relaxed mb-8">
          아래 버튼을 누르면 소리로 연결 코드를<br />가족의 휴대폰에 전송합니다
        </p>

        {/* 연결 코드 표시 */}
        {code ? (
          <div className="mb-6">
            <p className="text-xs text-stone-400 text-center mb-2">연결 코드</p>
            <div className="text-3xl font-black tracking-[0.3em] text-stone-800 text-center">
              {code}
            </div>
          </div>
        ) : (
          <div className="mb-6 flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-[#E8725C] border-t-transparent" />
          </div>
        )}

        {/* 소리 전송 버튼 */}
        {!transmitting ? (
          <button
            onClick={handleStartTransmit}
            disabled={!code}
            className="w-32 h-32 rounded-full bg-coral text-white pressable disabled:opacity-40 flex flex-col items-center justify-center shadow-lg shadow-[#E8725C]/30"
          >
            <svg className="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <span className="text-sm font-bold">소리 전송</span>
          </button>
        ) : (
          <button
            onClick={handleStopTransmit}
            className="w-32 h-32 rounded-full bg-stone-800 text-white pressable flex flex-col items-center justify-center shadow-lg animate-pulse"
          >
            <svg className="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <span className="text-sm font-bold">전송 중...</span>
          </button>
        )}

        <p className="mt-8 text-xs text-stone-300 text-center leading-relaxed">
          가족의 휴대폰에서 할마이 앱을 열고<br />
          &quot;마이크 허용&quot;을 눌러주세요<br /><br />
          소리가 안 되면 위의 코드를 직접 입력해도 됩니다
        </p>
      </div>
    </AppShell>
  );
}
