"use client";

import { LinkedDevice } from "@/lib/api";

interface SeniorTabsProps {
  devices: LinkedDevice[];
  selected: string; // pid
  onSelect: (pid: string) => void;
  onAdd: () => void;
}

export default function SeniorTabs({ devices, selected, onSelect, onAdd }: SeniorTabsProps) {
  if (devices.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto scrollbar-hide min-h-[60px]">
      {devices.map((d) => {
        const isActive = d.pid === selected;
        return (
          <button
            key={d.pid}
            onClick={() => onSelect(d.pid)}
            className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-semibold pressable transition-all ${
              isActive
                ? "bg-coral text-white shadow-sm shadow-[#E8725C]/20"
                : "bg-white border border-stone-200 text-stone-500"
            }`}
          >
            {d.nickname || "부모님"}
          </button>
        );
      })}
      <button
        onClick={onAdd}
        className="shrink-0 w-9 h-9 rounded-full border border-dashed border-stone-300 flex items-center justify-center pressable"
      >
        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
