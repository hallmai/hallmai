"use client";

import { useI18n } from "@/lib/i18n";
import MobileLayout from "@/components/mobile-layout";
import AlertBanner from "@/components/alert-banner";
import VoiceSummary from "@/components/voice-summary";
import StatsRow from "@/components/stats-row";
import MoodChart from "@/components/mood-chart";
import CallDurationChart from "@/components/call-duration-chart";
import WeeklyInsight from "@/components/weekly-insight";
import CareCard from "@/components/care-card";
import type { CareCardProps } from "@/components/care-card";
import LinkSeniorPrompt from "@/components/link-senior-prompt";
import SeniorTabs from "@/components/senior-tabs";
import { fetchLinkedDevices, LinkedDevice } from "@/lib/api";
import { useEffect, useState } from "react";

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

export default function DashboardPage() {
  const { t } = useI18n();
  const [devices, setDevices] = useState<LinkedDevice[] | null>(null);
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);

  useEffect(() => {
    fetchLinkedDevices().then((devs) => {
      setDevices(devs);
      if (devs.length > 0 && !selectedPid) {
        setSelectedPid(devs[0].pid);
      }
    });
  }, []);

  const handleLinked = () => {
    setShowLinkPrompt(false);
    fetchLinkedDevices().then((devs) => {
      setDevices(devs);
      if (devs.length > 0) {
        setSelectedPid(devs[devs.length - 1].pid);
      }
    });
  };

  // 로딩 중
  if (devices === null) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-[#E8725C] border-t-transparent" />
        </div>
      </MobileLayout>
    );
  }

  // 연결된 시니어 없음 or 추가 연결 모드
  if (devices.length === 0 || showLinkPrompt) {
    return (
      <MobileLayout>
        {showLinkPrompt && devices.length > 0 && (
          <div className="px-5 pt-3">
            <button
              onClick={() => setShowLinkPrompt(false)}
              className="text-[14px] text-[#E8725C] font-medium"
            >
              &larr; 돌아가기
            </button>
          </div>
        )}
        <LinkSeniorPrompt onLinked={handleLinked} />
      </MobileLayout>
    );
  }

  const selectedDevice = devices.find((d) => d.pid === selectedPid) || devices[0];
  const seniorName = selectedDevice.nickname || "어르신";

  return (
    <MobileLayout>
      {/* Senior Tabs */}
      {devices.length > 0 && (
        <SeniorTabs
          devices={devices}
          selected={selectedDevice.pid}
          onSelect={setSelectedPid}
          onAdd={() => setShowLinkPrompt(true)}
        />
      )}

      {/* Title */}
      <div className="px-5 pt-2 pb-1">
        <h1 className="text-[28px] font-black text-stone-800 tracking-tight leading-tight">
          {seniorName} 안부
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
        <CallDurationChart />
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
