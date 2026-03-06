"use client";

import { useI18n } from "@/lib/i18n";

const data = [
  { min: 18 },
  { min: 12 },
  { min: 25 },
  { min: 8 },
  { min: 22 },
  { min: 15 },
  { min: 20 },
];

const W = 280;
const H = 100;
const PAD_X = 0;
const PAD_TOP = 8;
const PAD_BOT = 4;

export default function CallDurationChart() {
  const { t } = useI18n();

  const maxVal = Math.max(...data.map((d) => d.min));
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_TOP - PAD_BOT;

  const points = data.map((d, i) => {
    const x = PAD_X + (i / (data.length - 1)) * chartW;
    const y = PAD_TOP + chartH - (d.min / maxVal) * chartH;
    return { x, y, min: d.min };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

  const days = [t.dayMon, t.dayTue, t.dayWed, t.dayThu, t.dayFri, t.daySat, t.daySun];
  const totalMin = data.reduce((s, d) => s + d.min, 0);

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-[15px] font-bold text-stone-800 tracking-tight">
          {t.weeklyCallDuration}
        </h3>
        <span className="text-[11px] text-stone-400">{t.weeklyMoodRange}</span>
      </div>
      <p className="text-[11px] text-stone-400 mb-4">
        {t.weeklyCallTotal} <span className="font-bold text-stone-600">{totalMin}{t.weeklyCallUnit}</span>
      </p>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8725C" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#E8725C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="#E8725C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="white" stroke="#E8725C" strokeWidth={2} />
          ))}
          {points.map((p, i) => (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="text-[9px] font-semibold"
              fill="#78716c"
            >
              {p.min}
            </text>
          ))}
        </svg>

        <div className="flex justify-between mt-1 px-0">
          {days.map((d, i) => (
            <span key={i} className="text-[10px] text-stone-400 font-medium flex-1 text-center">
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
