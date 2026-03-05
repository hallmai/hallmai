"use client";

import { useState } from "react";
import PhoneFrame from "@/components/phone-frame";
import BottomNav from "@/components/bottom-nav";

// Weekly mood data (0=low, 1=high) — 월~일
const WEEKLY_MOOD = [0.4, 0.5, 0.7, 0.45, 0.3, 0.82, 0.88];
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function MoodChart() {
  const W = 300;
  const H = 110;
  const PAD = 10;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;

  const points = WEEKLY_MOOD.map((v, i) => ({
    x: PAD + (i / (WEEKLY_MOOD.length - 1)) * chartW,
    y: PAD + chartH - v * chartH,
  }));

  // Catmull-Rom → cubic bezier path
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const p0 = points[Math.max(i - 2, 0)];
    const p1 = points[i - 1];
    const p2 = pt;
    const p3 = points[Math.min(i + 1, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x},${H} L ${points[0].x},${H} Z`;

  // Highlight last point (today)
  const last = points[points.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "110px" }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8945C" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E8945C" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#moodGrad)" />
        <path d={pathD} fill="none" stroke="#E8945C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Today dot */}
        <circle cx={last.x} cy={last.y} r="5" fill="#E8945C" />
        <circle cx={last.x} cy={last.y} r="9" fill="rgba(232,148,92,0.2)" />
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between px-2 -mt-1">
        {DAY_LABELS.map((d, i) => (
          <span
            key={d}
            className="text-[11px] font-medium"
            style={{ color: i === 6 ? "#E8945C" : "#8B7262" }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-dvh" style={{ background: "#FFF7EE" }}>
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: "#FFE8D6" }}
            >
              <span className="material-symbols-outlined fill-icon" style={{ color: "#E8945C", fontSize: "24px" }}>
                person
              </span>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#8B7262" }}>모니터링</p>
              <p className="text-base font-bold" style={{ color: "#3D2B1F" }}>부모님 상태</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full"
                style={{ background: "#FFFCF8", boxShadow: "0 2px 8px rgba(61,43,31,0.07)" }}
              >
                <span className="material-symbols-outlined fill-icon" style={{ color: "#3D2B1F", fontSize: "20px" }}>
                  notifications
                </span>
              </button>
              <span
                className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: "#E8A44C", borderColor: "#FFF7EE" }}
              />
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: "#FFFCF8", boxShadow: "0 2px 8px rgba(61,43,31,0.07)" }}
            >
              <span className="material-symbols-outlined" style={{ color: "#3D2B1F", fontSize: "20px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                more_vert
              </span>
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide space-y-4">

          {/* Mood hero */}
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(61,43,31,0.07)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#FFE8D6" }}
            >
              <span style={{ fontSize: "38px", lineHeight: 1 }}>😊</span>
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "#3D2B1F" }}>
                엄마, 오늘 기분 좋으셨대요
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#8B7262" }}>
                오전 10:30에 대화 완료
              </p>
              <div
                className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full"
                style={{ background: "#E8F5E9" }}
              >
                <span className="text-xs font-bold" style={{ color: "#4CAF50" }}>안정</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4"
              style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(61,43,31,0.07)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined fill-icon" style={{ color: "#E8945C", fontSize: "18px" }}>
                  directions_walk
                </span>
                <p className="text-xs font-medium" style={{ color: "#8B7262" }}>활동량 · 걸음</p>
              </div>
              <p className="font-bold" style={{ color: "#3D2B1F", fontSize: "24px" }}>
                6,420 <span className="text-sm font-medium" style={{ color: "#8B7262" }}>/ 8k</span>
              </p>
              <div className="mt-2.5 h-1.5 rounded-full" style={{ background: "rgba(61,43,31,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: "80%", background: "#E8945C" }} />
              </div>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(61,43,31,0.07)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined fill-icon" style={{ color: "#A8B89C", fontSize: "18px" }}>
                  bedtime
                </span>
                <p className="text-xs font-medium" style={{ color: "#8B7262" }}>수면</p>
              </div>
              <p className="font-bold" style={{ color: "#3D2B1F", fontSize: "24px" }}>
                7.5 <span className="text-sm font-medium" style={{ color: "#8B7262" }}>시간</span>
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined fill-icon" style={{ color: "#4CAF50", fontSize: "14px" }}>
                  trending_up
                </span>
                <p className="text-xs font-medium" style={{ color: "#4CAF50" }}>평균 대비 +12%</p>
              </div>
            </div>
          </div>

          {/* Weekly mood chart */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(61,43,31,0.07)" }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>주간 감정 변화</p>
                <p className="text-xs mt-0.5" style={{ color: "#8B7262" }}>대화 내용을 기반으로 집계됨</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#E8F5E9", color: "#4CAF50" }}
                >
                  안정
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2 mb-3">
              <p
                className="font-bold leading-tight"
                style={{ fontFamily: "'Noto Serif KR', serif", fontSize: "22px", color: "#3D2B1F" }}
              >
                밝은 기조 유지 중
              </p>
              <span className="text-sm font-bold" style={{ color: "#4CAF50" }}>+5%</span>
              <span className="text-xs" style={{ color: "#8B7262" }}>전주 대비</span>
            </div>
            <MoodChart />
          </div>

          {/* Summary card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(61,43,31,0.07)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8B7262" }}>
                오늘의 대화 요약
              </p>
              <div className="flex gap-0.5" style={{ color: "#C4A99A" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>subject</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>edit</span>
              </div>
            </div>
            <p
              className="text-base leading-relaxed"
              style={{ color: "#3D2B1F", fontStyle: "italic", fontFamily: "'Noto Serif KR', serif" }}
            >
              &ldquo;아침에 산책하시고, 무릎이 좀 시큰하다고 하셨어요&rdquo;
            </p>
          </div>

          {/* Warning banner */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "#FFF4E1" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#E8A44C" }}
            >
              <span className="text-white font-black text-base leading-none">!</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: "#3D2B1F" }}>주의 신호가 있어요</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B7262" }}>통증 언급이 있었어요</p>
            </div>
            <button className="text-sm font-bold shrink-0" style={{ color: "#E8945C" }}>
              상세보기
            </button>
          </div>

          {/* AI insights */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: "16px" }}>✦</span>
              <p className="text-base font-bold" style={{ color: "#3D2B1F" }}>AI 인사이트</p>
            </div>
            <div className="space-y-3">
              <div
                className="rounded-2xl p-4 flex items-start gap-4"
                style={{ background: "#FFFCF8", boxShadow: "0 2px 12px rgba(61,43,31,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#EEF2FF" }}
                >
                  <span className="material-symbols-outlined fill-icon" style={{ color: "#7986CB", fontSize: "20px" }}>
                    psychology
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>사회적 교류 알림</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "#8B7262" }}>
                    오늘 대화 시간이 평소보다 45% 늘었어요. 정서적 만족도가 높은 날이에요.
                  </p>
                  <button className="text-xs font-bold mt-1.5" style={{ color: "#E8945C" }}>
                    상세 분석 보기 &rsaquo;
                  </button>
                </div>
              </div>
              <div
                className="rounded-2xl p-4 flex items-start gap-4"
                style={{ background: "#FFFCF8", boxShadow: "0 2px 12px rgba(61,43,31,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#FFF3E0" }}
                >
                  <span className="material-symbols-outlined fill-icon" style={{ color: "#FF9800", fontSize: "20px" }}>
                    wb_sunny
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>아침 루틴 변화</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "#8B7262" }}>
                    평소보다 30분 일찍 일어나셨어요. 수면의 질이 좋은 날이에요.
                  </p>
                </div>
              </div>
              <div
                className="rounded-2xl p-4 flex items-start gap-4"
                style={{ background: "#FFFCF8", boxShadow: "0 2px 12px rgba(61,43,31,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#E8F5E9" }}
                >
                  <span className="material-symbols-outlined fill-icon" style={{ color: "#66BB6A", fontSize: "20px" }}>
                    favorite
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>이번 주 컨디션</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "#8B7262" }}>
                    지난주 대비 긍정 표현이 23% 늘었어요. 전반적으로 안정적인 한 주예요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-1">
            <button
              className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 text-white transition-transform active:scale-[0.98]"
              style={{ background: "#A8B89C" }}
            >
              <span className="material-symbols-outlined fill-icon" style={{ fontSize: "20px" }}>call</span>
              엄마에게 전화하기
            </button>
            <button
              onClick={() => setShowMessageInput(!showMessageInput)}
              className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              style={{ background: "#FFE8D6", color: "#3D2B1F" }}
            >
              <span className="material-symbols-outlined fill-icon" style={{ fontSize: "20px", color: "#3D2B1F" }}>chat_bubble</span>
              한마디 남기기
            </button>
          </div>

          {/* Message input */}
          {showMessageInput && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(61,43,31,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-full py-3 pl-5 pr-4 text-base font-medium outline-none"
                  style={{ background: "#FFF7EE", color: "#3D2B1F", border: "1.5px solid rgba(61,43,31,0.1)" }}
                  placeholder="부모님께 한마디 남기기..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0 text-white"
                  style={{ background: "#E8945C" }}
                  disabled={!message.trim()}
                >
                  <span className="material-symbols-outlined fill-icon" style={{ fontSize: "18px" }}>send</span>
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
