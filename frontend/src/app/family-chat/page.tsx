"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/phone-frame";
import BottomNav from "@/components/bottom-nav";

type ChatMessage = { from: "me" | "other"; name: string; text: string; time: string };

const MOCK_CHAT: ChatMessage[] = [
  { from: "other", name: "큰언니", text: "엄마 어제 리포트 봤어? 기분 좋으시다고 하던데 😊", time: "오전 9:12" },
  { from: "me", name: "나", text: "응! 나도 봤어. 산책도 하셨다니 다행이다.", time: "오전 9:15" },
  { from: "other", name: "큰언니", text: "무릎 아프시다는 거 걱정되긴 해. 이번 주말에 통화해봐야겠어.", time: "오전 9:17" },
  { from: "me", name: "나", text: "좋아, 나도 같이 할게! 영상통화로 하자.", time: "오전 9:20" },
];

export default function FamilyChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const router = useRouter();

  function handleSend() {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "me", name: "나", text: input.trim(), time: "방금" },
    ]);
    setInput("");
  }

  return (
    <PhoneFrame white>
      <div className="flex flex-col min-h-dvh">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 pt-8 pb-4 bg-white border-b border-slate-100">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100"
          >
            <span
              className="material-symbols-outlined text-slate-900"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              arrow_back
            </span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">가족 채팅</h1>
            <p className="text-sm text-slate-500">엄마 • 큰언니 • 나</p>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              more_horiz
            </span>
          </button>
        </header>

        {/* Pinned report card */}
        <div className="mx-4 mt-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary fill-icon text-2xl">push_pin</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary">오늘 안부 리포트</p>
            <p className="text-sm font-semibold text-slate-900 truncate">😊 매우 좋음 · 산책 다녀오심</p>
          </div>
          <button
            onClick={() => router.push("/report")}
            className="text-primary text-xs font-bold shrink-0"
          >
            보기
          </button>
        </div>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.from === "me" ? "flex-row-reverse" : ""}`}
            >
              {msg.from === "other" && (
                <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center shrink-0 mb-1">
                  <span className="material-symbols-outlined text-primary text-lg fill-icon">person</span>
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col gap-1 ${msg.from === "me" ? "items-end" : "items-start"}`}>
                {msg.from === "other" && (
                  <p className="text-xs font-semibold text-slate-500 ml-1">{msg.name}</p>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-base font-medium leading-relaxed ${
                    msg.from === "me"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-white border border-slate-100 text-slate-900 shadow-sm rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <p className="text-[11px] text-slate-400 mx-1">{msg.time}</p>
              </div>
            </div>
          ))}
        </main>

        {/* Input */}
        <div className="bg-white border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-background-light rounded-full py-3 px-5 text-slate-800 font-medium text-base placeholder:text-slate-400 outline-none border-none"
              placeholder="메시지 입력..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-40 shrink-0"
            >
              <span className="material-symbols-outlined text-lg fill-icon">send</span>
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
