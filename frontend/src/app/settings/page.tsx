"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/phone-frame";
import BottomNav from "@/components/bottom-nav";

type Frequency = "daily" | "occasional" | "never";

const OPTIONS: {
  value: Frequency;
  label: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    value: "daily",
    label: "매일",
    description: "매일 새로운 안부 카드를 공유합니다",
  },
  {
    value: "occasional",
    label: "가끔",
    description: "감정 신호가 평소와 다를 때만 전송",
    recommended: true,
  },
  {
    value: "never",
    label: "안 보내기",
    description: "안부 카드 공유 기능을 비활성화합니다",
  },
];

export default function SettingsPage() {
  const [selected, setSelected] = useState<Frequency>("occasional");
  const router = useRouter();

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-dvh" style={{ background: "#FFF7EE" }}>
        {/* Header */}
        <header className="flex items-center px-5 pt-10 pb-4 gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full shrink-0"
            style={{ background: "#FFE8D6" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#3D2B1F", fontSize: "20px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              arrow_back
            </span>
          </button>
          <h1 className="text-lg font-bold" style={{ color: "#3D2B1F" }}>
            가족 설정
          </h1>
        </header>

        <main className="flex-1 px-5 pb-6 overflow-y-auto scrollbar-hide space-y-6">
          {/* Family group */}
          <div className="flex flex-col items-center pt-2 pb-2">
            <div className="relative mb-4">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: "#FFE8D6",
                  boxShadow: "0 8px 32px rgba(232,148,92,0.2)",
                }}
              >
                <span
                  className="material-symbols-outlined fill-icon"
                  style={{ color: "#E8945C", fontSize: "52px" }}
                >
                  group
                </span>
              </div>
              <div
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#E8945C", boxShadow: "0 2px 8px rgba(232,148,92,0.4)" }}
              >
                <span
                  className="material-symbols-outlined text-white fill-icon"
                  style={{ fontSize: "16px" }}
                >
                  edit
                </span>
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: "#3D2B1F" }}>
              우리 가족 그룹
            </p>
            <p className="text-sm font-medium mt-1" style={{ color: "#8B7262" }}>
              멤버 4명
            </p>
          </div>

          {/* Frequency settings */}
          <div>
            <p className="text-lg font-bold mb-4" style={{ color: "#3D2B1F" }}>
              안부 카드 공유 빈도 설정
            </p>
            <div className="space-y-3">
              {OPTIONS.map((opt) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelected(opt.value)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl text-left transition-all"
                    style={{
                      background: isSelected ? "#FFF4E8" : "#FFFCF8",
                      border: isSelected ? "2px solid #E8945C" : "2px solid rgba(61,43,31,0.07)",
                    }}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-base font-bold" style={{ color: "#3D2B1F" }}>
                          {opt.label}
                        </span>
                        {opt.recommended && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "#FFE8D6", color: "#E8945C" }}
                          >
                            추천
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "#8B7262" }}>
                        {opt.description}
                      </p>
                    </div>
                    {/* Radio button */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2"
                      style={{
                        borderColor: isSelected ? "#E8945C" : "#C4A99A",
                        background: isSelected ? "#E8945C" : "transparent",
                      }}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy notice */}
          <div
            className="rounded-2xl p-4 flex gap-3 items-start"
            style={{ background: "#FFFCF8", border: "1px solid rgba(61,43,31,0.07)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(61,43,31,0.06)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#8B7262", fontSize: "16px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                shield
              </span>
            </div>
            <p className="text-sm leading-normal" style={{ color: "#8B7262" }}>
              건강 세부 내용, 가족 갈등, 금전 관련 내용은 카드에 포함되지 않습니다.
              사용자의 민감한 정보는 안전하게 보호됩니다.
            </p>
          </div>
        </main>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
