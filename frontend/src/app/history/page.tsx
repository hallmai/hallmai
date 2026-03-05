import Link from "next/link";
import PhoneFrame from "@/components/phone-frame";
import BottomNav from "@/components/bottom-nav";

const MOCK_HISTORY = [
  {
    date: "10월 24일",
    mood: "😊",
    icon: "calendar_today",
    activity: "산책하고 독서모임 다녀오심",
  },
  {
    date: "10월 23일",
    mood: "😐",
    icon: "restaurant",
    activity: "가족들과 즐거운 저녁 식사",
  },
  {
    date: "10월 22일",
    mood: "😊",
    icon: "park",
    activity: "동네 공원 산책과 휴식",
  },
  {
    date: "10월 21일",
    mood: "😔",
    icon: "medication",
    activity: "잊지 않고 약 복용 완료",
  },
  {
    date: "10월 20일",
    mood: "😊",
    icon: "call",
    activity: "손주들과 즐거운 영상 통화",
  },
];

export default function HistoryPage() {
  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-dvh" style={{ background: "#FFF7EE" }}>
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-10 pb-4">
          <Link href="/report">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: "#FFE8D6" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#3D2B1F", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "20px" }}
              >
                arrow_back
              </span>
            </button>
          </Link>
          <h1 className="text-lg font-bold" style={{ color: "#3D2B1F" }}>
            가족 기록 히스토리
          </h1>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: "#FFE8D6" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#3D2B1F", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "20px" }}
            >
              calendar_month
            </span>
          </button>
        </header>

        {/* Month summary */}
        <div className="px-5 pb-4">
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(61,43,31,0.07)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#FFE8D6" }}
            >
              <span className="material-symbols-outlined fill-icon" style={{ color: "#E8945C", fontSize: "24px" }}>
                calendar_month
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>10월 요약</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B7262" }}>대화 14일 완료 · 평균 기분 😊</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: "#4CAF50" }}>
                안정적
              </span>
            </div>
          </div>
        </div>

        {/* Month filter */}
        <div className="px-5 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {["10월", "9월", "8월", "7월"].map((m, i) => (
            <button
              key={m}
              className="px-4 py-2 rounded-full text-sm font-semibold shrink-0"
              style={i === 0
                ? { background: "#E8945C", color: "#fff" }
                : { background: "#FFFCF8", color: "#8B7262", border: "1px solid rgba(61,43,31,0.1)" }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <main className="flex-1 px-5 pb-6 overflow-y-auto scrollbar-hide">
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[19px] top-3 bottom-3 w-0.5"
              style={{ background: "rgba(232,148,92,0.2)" }}
            />

            <div className="space-y-1">
              {MOCK_HISTORY.map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-3">
                  {/* Icon circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10"
                    style={{ background: "#FFE8D6" }}
                  >
                    <span
                      className="material-symbols-outlined fill-icon"
                      style={{ color: "#E8945C", fontSize: "18px" }}
                    >
                      {item.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 rounded-2xl p-4"
                    style={{
                      background: "#FFFCF8",
                      boxShadow: "0 2px 12px rgba(61,43,31,0.06)",
                    }}
                  >
                    <p className="font-bold text-base" style={{ color: "#3D2B1F" }}>
                      <span>{item.date.split("일")[0]}일</span>{" "}
                      <span>{item.mood}</span>{" "}
                      {item.activity}
                    </p>
                    <Link href="/report">
                      <p
                        className="text-sm font-semibold mt-1.5"
                        style={{ color: "#E8945C" }}
                      >
                        상세 리포트 보기 &rsaquo;
                      </p>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load more */}
          <div className="flex justify-center mt-4">
            <button
              className="px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-1"
              style={{
                background: "#FFFCF8",
                color: "#8B7262",
                border: "1px solid rgba(61,43,31,0.1)",
              }}
            >
              이전 기록 더보기
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                expand_more
              </span>
            </button>
          </div>
        </main>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
