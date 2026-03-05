import Link from "next/link";
import PhoneFrame from "@/components/phone-frame";

export default function Home() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const period = hours >= 12 ? "오후" : "오전";

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-dvh relative overflow-hidden">
        {/* Background glow orbs */}
        <div
          className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,148,92,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-32 left-[-80px] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(240,216,184,0.35) 0%, transparent 70%)" }}
        />

        <div className="flex flex-col flex-1 px-6 relative z-10">
          {/* Time */}
          <div className="flex flex-col items-center pt-14 pb-2">
            <p className="text-sm font-medium" style={{ color: "#8B7262" }}>
              {period} {displayHour}:{minutes}
            </p>
          </div>

          {/* Greeting */}
          <h1
            className="text-center mt-3 leading-snug"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: "36px",
              fontWeight: 700,
              color: "#3D2B1F",
              lineHeight: 1.4,
            }}
          >
            오늘도
            <br />
            좋은 하루예요
          </h1>

          {/* Big round button */}
          <div className="flex flex-col items-center flex-1 justify-center mt-6">
            <div className="relative flex items-center justify-center">
              {/* Glow rings */}
              <div
                className="glow-ring"
                style={{ width: "260px", height: "260px", animationDelay: "0s" }}
              />
              <div
                className="glow-ring"
                style={{ width: "240px", height: "240px", animationDelay: "0.6s", opacity: 0.22 }}
              />

              <Link href="/conversation">
                <button
                  className="relative flex flex-col items-center justify-center rounded-full transition-transform active:scale-95"
                  style={{
                    width: "220px",
                    height: "220px",
                    background: "#E8945C",
                    boxShadow: "0 16px 48px rgba(232,148,92,0.45)",
                    zIndex: 1,
                  }}
                >
                  <span
                    className="text-white font-bold leading-tight text-center"
                    style={{
                      fontFamily: "'Noto Serif KR', serif",
                      fontSize: "28px",
                      lineHeight: 1.4,
                    }}
                  >
                    이야기
                    <br />
                    시작하기
                  </span>
                </button>
              </Link>
            </div>

            {/* Helper text */}
            <p
              className="mt-7 text-center text-base font-medium"
              style={{ color: "#8B7262" }}
            >
              버튼을 누르면 할마이가 이야기를 들어줘요
            </p>
          </div>

          {/* Family reply card */}
          <Link href="/family-chat">
            <div
              className="rounded-2xl p-5 flex items-center gap-4 mb-10 active:scale-[0.98] transition-transform"
              style={{
                background: "#FFFCF8",
                boxShadow: "0 4px 20px rgba(61,43,31,0.08)",
              }}
            >
              <span className="text-3xl shrink-0">💌</span>
              <p className="text-base font-medium leading-snug" style={{ color: "#3D2B1F" }}>
                따님이{" "}
                <span className="font-bold">
                  &lsquo;내일 저녁에 전화할게요&rsquo;
                </span>
                라고 남기셨어요
              </p>
            </div>
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
