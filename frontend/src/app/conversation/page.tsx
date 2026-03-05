"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/phone-frame";

type Message = { role: "ai" | "user"; text: string };
type MicStatus = "idle" | "requesting" | "active" | "denied";

const MOCK_MESSAGES: Message[] = [
  { role: "ai", text: "안녕하세요~ 오늘 기분이 어떠세요?" },
  { role: "user", text: "응, 오늘은 좀 무릎이 시큰해서..." },
  { role: "ai", text: "아이고, 무릎이 아프시구나... 많이 불편하시죠?" },
];

const NUM_BARS = 5;

export default function ConversationPage() {
  const [elapsed, setElapsed] = useState(0);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [barHeights, setBarHeights] = useState<number[]>([0.4, 0.65, 0.85, 0.65, 0.4]);

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const startVisualization = useCallback((analyser: AnalyserNode) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const binStep = Math.floor(bufferLength / NUM_BARS);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      const heights = Array.from({ length: NUM_BARS }, (_, i) => {
        const start = i * binStep;
        const end = start + binStep;
        let sum = 0;
        for (let j = start; j < end; j++) sum += dataArray[j];
        return Math.max(0.15, (sum / binStep) / 255);
      });
      setBarHeights(heights);
    };
    draw();
  }, []);

  const startMic = useCallback(async () => {
    setMicStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicStatus("active");
      startVisualization(analyser);
    } catch {
      setMicStatus("denied");
    }
  }, [startVisualization]);

  useEffect(() => {
    startMic();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [startMic]);

  const stopAndNavigate = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    router.push("/processing");
  };

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  // Bar heights for 5 bars with mirrored center peak
  const displayHeights = micStatus === "active" ? barHeights : [0.4, 0.65, 0.85, 0.65, 0.4];

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-dvh" style={{ background: "#FFF7EE" }}>
        {/* Header */}
        <header className="flex flex-col items-center pt-10 pb-4 px-6">
          {/* Timer */}
          <p
            className="font-bold"
            style={{ fontSize: "48px", color: "#3D2B1F", lineHeight: 1.1 }}
          >
            {mins}:{secs}
          </p>
          <p className="text-base font-medium mt-1" style={{ color: "#8B7262" }}>
            {micStatus === "active" ? "대화 중..." : micStatus === "requesting" ? "연결 중..." : "대화 중..."}
          </p>
        </header>

        {/* Waveform */}
        <div className="flex flex-col items-center py-6 px-4">
          {micStatus === "denied" ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "64px", color: "#C4A99A", fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
              >
                mic_off
              </span>
              <p className="text-base text-center leading-relaxed" style={{ color: "#8B7262" }}>
                마이크 권한이 필요해요.
                <br />
                브라우저 설정에서 허용해 주세요.
              </p>
              <button
                onClick={startMic}
                className="mt-2 px-6 py-3 rounded-full font-semibold text-sm text-white"
                style={{ background: "#E8945C" }}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="flex items-end justify-center gap-3" style={{ height: "80px" }}>
              {displayHeights.map((h, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: "14px",
                    height: `${Math.round(h * 80)}px`,
                    background: `rgba(232, 148, 92, ${0.5 + h * 0.5})`,
                    transition: "height 80ms ease-out",
                  }}
                />
              ))}
            </div>
          )}

          <p className="mt-5 text-lg font-semibold" style={{ color: "#E8945C" }}>
            {micStatus === "requesting"
              ? "마이크 연결 중..."
              : micStatus === "denied"
              ? ""
              : "듣고 있어요..."}
          </p>
        </div>

        {/* Chat messages */}
        <main className="flex-1 overflow-y-auto px-5 py-2 space-y-5 scrollbar-hide">
          {MOCK_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "ai" && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
                  style={{ background: "#FFE8D6" }}
                >
                  🌸
                </div>
              )}
              <div
                className="px-5 py-4 rounded-2xl text-lg leading-relaxed font-medium max-w-[78%]"
                style={
                  msg.role === "ai"
                    ? {
                        background: "#FFE8D6",
                        color: "#3D2B1F",
                        borderBottomLeftRadius: "6px",
                      }
                    : {
                        background: "#FFFCF8",
                        color: "#3D2B1F",
                        border: "1px solid rgba(61,43,31,0.08)",
                        borderBottomRightRadius: "6px",
                        boxShadow: "0 2px 8px rgba(61,43,31,0.06)",
                      }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Footer */}
        <footer className="p-6" style={{ borderTop: "1px solid rgba(61,43,31,0.06)" }}>
          <button
            onClick={stopAndNavigate}
            className="w-full py-5 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition-colors active:scale-[0.98] text-white"
            style={{ background: "#E07850" }}
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              call_end
            </span>
            대화 끝내기
          </button>
        </footer>
      </div>
    </PhoneFrame>
  );
}
