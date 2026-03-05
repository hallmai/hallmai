"use client";

import { useState } from "react";
import PhoneFrame from "@/components/phone-frame";
import BottomNav from "@/components/bottom-nav";

export default function ReportPage() {
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-dvh" style={{ background: "#FFF7EE" }}>
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-10 pb-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: "#FFFCF8", boxShadow: "0 2px 8px rgba(61,43,31,0.08)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#3D2B1F", fontSize: "20px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              menu
            </span>
          </button>
          <h1 className="text-lg font-bold" style={{ color: "#3D2B1F" }}>
            오늘 안부
          </h1>
          <div className="relative">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: "#FFFCF8", boxShadow: "0 2px 8px rgba(61,43,31,0.08)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#3D2B1F", fontSize: "20px", fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                notifications
              </span>
            </button>
            <span
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#E8A44C", borderColor: "#FFF7EE" }}
            />
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
          {/* Hero: mood */}
          <div className="flex flex-col items-center text-center pt-4 pb-6">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "#FFFCF8",
                boxShadow: "0 8px 32px rgba(61,43,31,0.1)",
              }}
            >
              <span style={{ fontSize: "64px", lineHeight: 1 }}>😊</span>
            </div>
            <p
              className="text-2xl font-bold leading-snug"
              style={{ color: "#3D2B1F" }}
            >
              엄마, 오늘 기분 좋으셨대요
            </p>
            <p className="text-sm font-medium mt-1.5" style={{ color: "#8B7262" }}>
              오전 10:30에 대화 완료
            </p>
          </div>

          {/* Summary card */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              background: "#FFFCF8",
              boxShadow: "0 4px 20px rgba(61,43,31,0.07)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8B7262" }}>
                오늘의 대화 요약
              </p>
              <div className="flex items-center gap-0.5" style={{ color: "#C4A99A" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  subject
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  edit
                </span>
              </div>
            </div>
            <p
              className="text-base leading-relaxed"
              style={{
                color: "#3D2B1F",
                fontStyle: "italic",
                fontFamily: "'Noto Serif KR', serif",
              }}
            >
              &ldquo;아침에 산책하시고, 무릎이 좀 시큰하다고 하셨어요&rdquo;
            </p>
          </div>

          {/* Warning banner */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3 mb-4"
            style={{ background: "#FFF4E1" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#E8A44C" }}
            >
              <span className="text-white font-black text-base leading-none">!</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: "#3D2B1F" }}>
                주의 신호가 있어요
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8B7262" }}>
                통증 언급이 있었어요
              </p>
            </div>
            <button className="text-sm font-bold shrink-0" style={{ color: "#E8945C" }}>
              상세보기
            </button>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              className="w-full py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 text-white transition-transform active:scale-[0.98]"
              style={{ background: "#A8B89C" }}
            >
              <span
                className="material-symbols-outlined fill-icon"
                style={{ fontSize: "22px" }}
              >
                call
              </span>
              엄마에게 전화하기
            </button>
            <button
              onClick={() => setShowMessageInput(!showMessageInput)}
              className="w-full py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              style={{ background: "#FFE8D6", color: "#3D2B1F" }}
            >
              <span
                className="material-symbols-outlined fill-icon"
                style={{ fontSize: "22px", color: "#3D2B1F" }}
              >
                chat_bubble
              </span>
              한마디 남기기
            </button>
          </div>

          {/* Message input */}
          {showMessageInput && (
            <div
              className="rounded-2xl p-4 mt-3"
              style={{
                background: "#FFFCF8",
                boxShadow: "0 4px 20px rgba(61,43,31,0.07)",
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-full py-3 pl-5 pr-4 text-base font-medium outline-none"
                  style={{
                    background: "#FFF7EE",
                    color: "#3D2B1F",
                    border: "1.5px solid rgba(61,43,31,0.1)",
                  }}
                  placeholder="부모님께 한마디 남기기..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0 text-white"
                  style={{ background: "#E8945C" }}
                  disabled={!message.trim()}
                >
                  <span className="material-symbols-outlined fill-icon" style={{ fontSize: "18px" }}>
                    send
                  </span>
                </button>
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
