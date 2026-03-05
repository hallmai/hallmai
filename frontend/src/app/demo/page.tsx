"use client";

import { useI18n } from "@/lib/i18n";
import MobileLayout from "@/components/mobile-layout";
import AlertBanner from "@/components/alert-banner";
import VoiceSummary from "@/components/voice-summary";
import StatsRow from "@/components/stats-row";
import MoodChart from "@/components/mood-chart";
import WeeklyInsight from "@/components/weekly-insight";
import CareCard from "@/components/care-card";
import type { CareCardProps } from "@/components/care-card";

const careCards: Omit<CareCardProps, "isLast">[] = [
  {
    dateKey: "cardToday",
    mood: "good",
    summaryKey: "cardSummary1",
  },
  {
    dateKey: "cardYesterday",
    mood: "okay",
    summaryKey: "cardSummary2",
    alertKeys: ["alertLoneliness"],
  },
  {
    dateKey: "cardMar3",
    mood: "good",
    summaryKey: "cardSummary3",
  },
  {
    dateKey: "cardMar2",
    mood: "low",
    summaryKey: "cardSummary4",
    alertKeys: ["alertSleepTag", "alertLowMood"],
  },
];

export default function Home() {
  const { t } = useI18n();

  return (
    <MobileLayout>
      {/* Title */}
      <div className="px-5 pt-2 pb-1">
        <h1 className="text-[28px] font-black text-stone-800 tracking-tight leading-tight">
          {t.title}
        </h1>
        <p className="text-[13px] text-stone-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      {/* Alert — full-width band */}
      <div className="px-5 pt-3">
        <AlertBanner />
      </div>

      {/* Voice Summary — dark hero section */}
      <div className="px-5 pt-4">
        <VoiceSummary />
      </div>

      {/* Regular card sections */}
      <div className="px-5 pt-5 pb-12 space-y-4">
        <StatsRow />
        <MoodChart />
        <WeeklyInsight />

        {/* Timeline Care Cards */}
        <section>
          <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">
            {t.dailyUpdates}
          </h2>
          <div>
            {careCards.map((card, i) => (
              <CareCard
                key={card.dateKey}
                {...card}
                isLast={i === careCards.length - 1}
              />
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
