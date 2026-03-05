"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const leftTab = { href: "/history", icon: "history", label: "안부 기록" };
  const rightTab = { href: "/settings", icon: "settings", label: "설정" };

  return (
    <nav
      className="flex justify-around items-center border-t shrink-0"
      style={{
        background: "#FFFAF5",
        borderColor: "rgba(61,43,31,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* 안부 기록 */}
      <Link
        href={leftTab.href}
        className="flex flex-col items-center gap-1 px-4 py-2"
        style={{ color: pathname === leftTab.href ? "#E8945C" : "#8B7262" }}
      >
        <span className={`material-symbols-outlined text-[24px] ${pathname === leftTab.href ? "fill-icon" : ""}`}>
          {leftTab.icon}
        </span>
        <span className="text-[10px] font-semibold">{leftTab.label}</span>
      </Link>

      {/* 대화 시작 — center FAB */}
      <Link href="/" className="flex flex-col items-center gap-1 px-4 py-1 -mt-5">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
          style={{
            background: "#E8945C",
            boxShadow: "0 6px 20px rgba(232,148,92,0.45)",
          }}
        >
          <span className="material-symbols-outlined fill-icon text-white" style={{ fontSize: "26px" }}>
            mic
          </span>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "#E8945C" }}>
          대화 시작
        </span>
      </Link>

      {/* 설정 */}
      <Link
        href={rightTab.href}
        className="flex flex-col items-center gap-1 px-4 py-2"
        style={{ color: pathname === rightTab.href ? "#E8945C" : "#8B7262" }}
      >
        <span className={`material-symbols-outlined text-[24px] ${pathname === rightTab.href ? "fill-icon" : ""}`}>
          {rightTab.icon}
        </span>
        <span className="text-[10px] font-semibold">{rightTab.label}</span>
      </Link>
    </nav>
  );
}
