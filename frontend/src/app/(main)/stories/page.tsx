"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import CareCard from "@/components/care-card";
import { AlertCard, VoiceSummaryCard, StatsCard, MoodChartCard, WeeklyInsightCard } from "@/components/feed-cards";
import LinkSeniorPrompt from "@/components/link-senior-prompt";
import SeniorTabs from "@/components/senior-tabs";
import { fetchLinkedDevices, fetchStoryCards, LinkedDevice, StoryCardData } from "@/lib/api";
import { isTokenValid } from "@/lib/auth";

// ── Demo: 데모 영상용 더미 데이터. 실제 API 데이터와 함께 "Mom" 탭으로 표시됨 ──
const DEMO_PID = "__demo__";

const DEMO_DEVICE: LinkedDevice = {
  pid: DEMO_PID,
  deviceUuid: "demo-uuid",
  nickname: "Mom",
  linkedAt: "2026-03-01T00:00:00Z",
};

const DEMO_CARDS: StoryCardData[] = [
  {
    pid: "demo-1",
    type: "daily",
    cardedAt: "2026-03-16T09:00:00Z",
    data: {
      topic: "She talked about her morning walk in the park. The cherry blossoms are starting to bloom and she said the air smelled sweet.",
      quote: "I think spring came early this year. The trees are so beautiful.",
      vibe: "warm",
    },
    createdAt: "2026-03-16T09:30:00Z",
  },
  {
    pid: "demo-2",
    type: "health",
    cardedAt: "2026-03-15T14:00:00Z",
    data: {
      topic: "She mentioned her knees have been feeling better since she started the new stretching routine. Slept well last night \u2014 about 7 hours.",
      quote: "The exercises from that TV show really do work. My legs feel lighter.",
      vibe: "warm",
    },
    createdAt: "2026-03-15T14:30:00Z",
  },
  {
    pid: "demo-3",
    type: "memory",
    cardedAt: "2026-03-15T10:00:00Z",
    data: {
      topic: "She told a story about taking you to the beach when you were five. You apparently cried because a crab pinched your toe, and she carried you all the way back.",
      quote: "You screamed so loud the whole beach turned around! But then you wanted to go back and find the crab.",
      vibe: "warm",
    },
    createdAt: "2026-03-15T10:30:00Z",
  },
  {
    pid: "demo-4",
    type: "daily",
    cardedAt: "2026-03-14T15:00:00Z",
    data: {
      topic: "She spent a cozy afternoon reorganizing her photo albums. Found old pictures from a family trip to Gyeongju and laughed at everyone's hairstyles.",
      quote: "Look at your father's perm! We thought it was so fashionable back then.",
      vibe: "warm",
    },
    createdAt: "2026-03-14T15:30:00Z",
  },
  {
    pid: "demo-5",
    type: "social",
    cardedAt: "2026-03-13T11:00:00Z",
    data: {
      topic: "She went to the senior center and played baduk with Mr. Kim. Won two out of three games and was quite proud. Stayed for lunch with the group.",
      quote: "Mr. Kim said I'm getting better. I think he let me win, though.",
      vibe: "warm",
    },
    createdAt: "2026-03-13T11:30:00Z",
  },
  {
    pid: "demo-6",
    type: "daily",
    cardedAt: "2026-03-12T10:00:00Z",
    data: {
      topic: "She cooked doenjang-jjigae for lunch and said it reminded her of grandma's recipe. She's been experimenting with adding zucchini lately.",
      quote: "Your grandmother never used zucchini, but I think she would have liked it.",
      vibe: "warm",
    },
    createdAt: "2026-03-12T10:30:00Z",
  },
  {
    pid: "demo-7",
    type: "memory",
    cardedAt: "2026-03-11T15:00:00Z",
    data: {
      topic: "She talked about the first apartment the family lived in. Said the kitchen was tiny but she made the best kimchi-jjigae there. She's planning to make japchae for the next family gathering.",
      quote: "That tiny kitchen made the best meals. I want to cook for everyone again soon!",
      vibe: "warm",
    },
    createdAt: "2026-03-11T15:30:00Z",
  },
  {
    pid: "demo-8",
    type: "social",
    cardedAt: "2026-03-10T11:00:00Z",
    data: {
      topic: "Had a long chat about the neighbor's new puppy. She's been visiting it every afternoon and says it always runs up to her when she walks by.",
      quote: "That little puppy waits for me by the gate now!",
      vibe: "warm",
    },
    createdAt: "2026-03-10T11:30:00Z",
  },
  {
    pid: "demo-9",
    type: "health",
    cardedAt: "2026-03-09T08:00:00Z",
    data: {
      topic: "She started a new morning stretching routine she learned from a TV program. Said she's been sleeping better and feels more energetic during the day.",
      quote: "I do the stretches every morning now. My body feels ten years younger!",
      vibe: "warm",
    },
    createdAt: "2026-03-09T08:30:00Z",
  },
  {
    pid: "demo-10",
    type: "daily",
    cardedAt: "2026-03-08T10:00:00Z",
    data: {
      topic: "She discovered a new trot song on YouTube and played it three times during our conversation. She even hummed along and tried to teach me the lyrics.",
      quote: "This singer has such a warm voice. Listen to this part!",
      vibe: "warm",
    },
    createdAt: "2026-03-08T10:30:00Z",
  },
];

const formatDateEN = (dt: string) => {
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateKR = (dt: string) => {
  const d = new Date(dt);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const VIBE_TO_MOOD: Record<string, "good" | "okay" | "low"> = { warm: "good", calm: "okay", quiet: "low" };
const vibeToMood = (vibe: string): "good" | "okay" | "low" => VIBE_TO_MOOD[vibe] ?? "okay";

const MOOD_LABELS_EN: Record<string, string> = { good: "Warm", okay: "Calm", low: "Quiet" };

export default function StoriesPage() {
  const { t } = useI18n();
  const [devices, setDevices] = useState<LinkedDevice[] | null>(null);
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [cards, setCards] = useState<StoryCardData[]>([]);

  useEffect(() => {
    if (!isTokenValid()) {
      // Not logged in: show demo only
      setDevices([]);
      setSelectedPid(DEMO_PID);
      return;
    }
    fetchLinkedDevices()
      .then((devs) => {
        setDevices(devs);
        if (!selectedPid) {
          setSelectedPid(devs.length > 0 ? devs[0].pid : DEMO_PID);
        }
      })
      .catch(() => setDevices([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPid) return;
    if (selectedPid === DEMO_PID) {
      setCards(DEMO_CARDS);
      return;
    }
    fetchStoryCards(selectedPid).then(setCards).catch(() => setCards([]));
  }, [selectedPid]);

  const handleLinked = () => {
    setShowLinkPrompt(false);
    fetchLinkedDevices()
      .then((devs) => {
        setDevices(devs);
        if (devs.length > 0) {
          setSelectedPid(devs[devs.length - 1].pid);
        }
      })
      .catch(() => {});
  };

  // Loading
  if (devices === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-[#E8725C] border-t-transparent" />
      </div>
    );
  }

  // Adding mode
  if (showLinkPrompt) {
    return (
      <div className="flex-1 flex flex-col pb-24">
        <div className="px-5 pt-3">
          <button
            onClick={() => setShowLinkPrompt(false)}
            className="text-[14px] text-[#E8725C] font-medium"
          >
            &larr; {t.settingsBack}
          </button>
        </div>
        <LinkSeniorPrompt onLinked={handleLinked} />
      </div>
    );
  }

  const devicesWithDemo = [...devices, DEMO_DEVICE];
  const selectedDevice = devicesWithDemo.find((d) => d.pid === selectedPid) || devicesWithDemo[0];
  const isDemo = selectedPid === DEMO_PID;

  const moodLabels = isDemo
    ? MOOD_LABELS_EN
    : { good: t.moodGood, okay: t.moodOkay, low: t.moodLow };
  const formatDate = isDemo ? formatDateEN : formatDateKR;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-24">
      {/* Senior Tabs */}
      <SeniorTabs
        devices={devicesWithDemo}
        selected={selectedDevice.pid}
        onSelect={setSelectedPid}
        onAdd={() => setShowLinkPrompt(true)}
      />

      {/* Feed */}
      <div className="px-5 pt-5 pb-12">
        {isDemo ? (
          <DemoFeed cards={cards} formatDate={formatDate} moodLabels={moodLabels} />
        ) : cards.length > 0 ? (
          <div className="flex flex-col gap-3">
            {cards.map((card) => (
              <CareCard
                key={card.pid}
                date={formatDate(card.cardedAt)}
                mood={vibeToMood(card.data.vibe)}
                moodLabel={moodLabels[vibeToMood(card.data.vibe)]}
                summary={card.data.topic}
                quote={card.data.quote}
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
      </div>
    </div>
  );
}

// Demo: 데모 영상용 피드 컴포넌트. 다양한 카드 타입을 섞어서 피드 형태로 보여줌
function DemoFeed({
  cards,
  formatDate,
  moodLabels,
}: {
  cards: StoryCardData[];
  formatDate: (dt: string) => string;
  moodLabels: Record<string, string>;
}) {
  const renderCards = (slice: StoryCardData[]) =>
    slice.map((card) => (
      <CareCard
        key={card.pid}
        date={formatDate(card.cardedAt)}
        mood={vibeToMood(card.data.vibe)}
        moodLabel={moodLabels[vibeToMood(card.data.vibe)]}
        summary={card.data.topic}
        quote={card.data.quote}
        cardType={card.type as "daily" | "health" | "memory" | "social" | "mood-alert"}
      />
    ));

  return (
    <div className="flex flex-col gap-3">
      <AlertCard
        title="12-day conversation streak!"
        detail="Mom has been chatting every day — her longest streak yet"
      />

      <VoiceSummaryCard
        title="Today's Conversation"
        duration="14:32"
        preview="She talked about her morning walk and the cherry blossoms blooming in the park. She seemed cheerful and mentioned wanting to visit the botanical garden this weekend..."
      />

      <StatsCard
        stats={[
          { value: "12", unit: "days", label: "streak" },
          { value: "6", unit: "calls", label: "this week" },
          { value: "\u{1F60A}", unit: "warm", label: "mood" },
        ]}
      />

      {renderCards(cards.slice(0, 3))}

      <MoodChartCard
        dateRange="Mar 10 - 16"
        days={[
          { day: "Mon", score: 0.8, level: "good" },
          { day: "Tue", score: 0.55, level: "okay" },
          { day: "Wed", score: 0.9, level: "good" },
          { day: "Thu", score: 0.65, level: "okay" },
          { day: "Fri", score: 0.75, level: "good" },
          { day: "Sat", score: 0.5, level: "okay" },
          { day: "Sun", score: 0.85, level: "good", today: true },
        ]}
      />

      {renderCards(cards.slice(3, 6))}

      <WeeklyInsightCard
        text="Mom has been more active this week, visiting the senior center twice and taking daily walks. She's been cooking new recipes and seems to be in great spirits."
        tags={["Active lifestyle", "Good appetite", "Social connections"]}
      />

      {renderCards(cards.slice(6))}
    </div>
  );
}
