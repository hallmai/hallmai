"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import CareCard from "@/components/care-card";
import LinkSeniorPrompt from "@/components/link-senior-prompt";
import SeniorTabs from "@/components/senior-tabs";
import { fetchLinkedDevices, fetchStoryCards, LinkedDevice, StoryCardData } from "@/lib/api";
import { isTokenValid } from "@/lib/auth";

const formatDate = (dt: string) => {
  const d = new Date(dt);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const vibeToMood = (vibe: string): "good" | "okay" | "low" =>
  ({ warm: "good", calm: "okay", quiet: "low" }[vibe] as "good" | "okay" | "low") ?? "okay";

export default function StoriesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [devices, setDevices] = useState<LinkedDevice[] | null>(null);
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [cards, setCards] = useState<StoryCardData[]>([]);

  // Auth guard
  useEffect(() => {
    if (!isTokenValid()) {
      router.replace("/call");
    }
  }, [router]);

  useEffect(() => {
    if (!isTokenValid()) return;
    fetchLinkedDevices().then((devs) => {
      setDevices(devs);
      if (devs.length > 0 && !selectedPid) {
        setSelectedPid(devs[0].pid);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPid) return;
    fetchStoryCards(selectedPid).then(setCards);
  }, [selectedPid]);

  const handleLinked = () => {
    setShowLinkPrompt(false);
    fetchLinkedDevices().then((devs) => {
      setDevices(devs);
      if (devs.length > 0) {
        setSelectedPid(devs[devs.length - 1].pid);
      }
    });
  };

  // Loading
  if (devices === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-[#E8725C] border-t-transparent" />
      </div>
    );
  }

  // No linked seniors or adding mode
  if (devices.length === 0 || showLinkPrompt) {
    return (
      <div className="flex-1 flex flex-col pb-24">
        {showLinkPrompt && devices.length > 0 && (
          <div className="px-5 pt-3">
            <button
              onClick={() => setShowLinkPrompt(false)}
              className="text-[14px] text-[#E8725C] font-medium"
            >
              &larr; {t.settingsBack}
            </button>
          </div>
        )}
        <LinkSeniorPrompt onLinked={handleLinked} />
      </div>
    );
  }

  const selectedDevice = devices.find((d) => d.pid === selectedPid) || devices[0];
  const seniorName = selectedDevice.nickname || "어르신";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-24">
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

      {/* Timeline Care Cards */}
      <div className="px-5 pt-5 pb-12">
        <section>
          <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">
            {t.dailyUpdates}
          </h2>
          {cards.length > 0 ? (
            <div>
              {cards.map((card, i) => (
                <CareCard
                  key={card.pid}
                  date={formatDate(card.cardedAt)}
                  mood={vibeToMood(card.data.vibe)}
                  summary={card.data.topic}
                  quote={card.data.quote}
                  isLast={i === cards.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-stone-500">{t.emptyCards}</p>
              <p className="text-[13px] text-stone-400 mt-1">{t.emptyCardsDesc}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
