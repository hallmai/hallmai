"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/phone-frame";

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/report"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <PhoneFrame>
      <div
        className="flex flex-col min-h-dvh items-center justify-center px-8 gap-10"
        style={{ background: "#FFF7EE" }}
      >
        {/* Envelope icon */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: "#FFE8D6",
            boxShadow: "0 12px 40px rgba(232,148,92,0.2)",
          }}
        >
          <span style={{ fontSize: "64px", lineHeight: 1 }}>✉️</span>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-5 w-full text-center">
          <h1
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: "30px",
              fontWeight: 700,
              color: "#3D2B1F",
              lineHeight: 1.5,
            }}
          >
            오늘 대화
            <br />
            정리하고 있어요...
          </h1>

          {/* Loading bar */}
          <div
            className="w-64 h-3 rounded-full overflow-hidden"
            style={{ background: "#F0D8B8" }}
          >
            <div
              className="loading-bar-fill h-full rounded-full"
              style={{ background: "#E8945C" }}
            />
          </div>

          <p className="text-base font-medium" style={{ color: "#8B7262" }}>
            잠깐만 기다려 주세요 😊
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
