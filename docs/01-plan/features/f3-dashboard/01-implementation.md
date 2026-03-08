# Feature 3 - 구현: API + CareCard + 대시보드 + i18n

## Step 1: API 클라이언트 추가

수정 파일: `frontend/src/lib/api.ts`

```typescript
export interface StoryCardData {
  pid: string;
  type: string;
  cardedAt: string;
  data: {
    topic: string;
    quote: string;
    vibe: 'warm' | 'calm' | 'quiet';
  };
  createdAt: string;
}

export async function fetchStoryCards(devicePid: string): Promise<StoryCardData[]>
// GET /api/story-cards/:devicePid (authHeaders 포함)
```

---

## Step 2: CareCard 컴포넌트 수정

수정 파일: `frontend/src/components/care-card.tsx`

현재 Props → 변경 Props:
```typescript
// Before (i18n 키 기반)
interface CareCardProps {
  dateKey: string;
  mood: "good" | "okay" | "low";
  summaryKey: string;
  alertKeys?: string[];
  isLast?: boolean;
}

// After (직접 데이터)
interface CareCardProps {
  date: string;
  mood: "good" | "okay" | "low";
  summary: string;
  quote?: string;
  isLast?: boolean;
}
```

- `alertKeys` 제거 (스펙에 없는 기능)
- i18n 키 조회 → 직접 텍스트 표시로 변경
- quote 표시 영역 추가 (인용문 스타일)

### Storybook stories 업데이트

수정 파일: `frontend/src/components/care-card.stories.tsx`

- Props 변경에 맞게 stories 수정: `dateKey/summaryKey` → `date/summary`
- `alertKeys` 제거, `quote` 추가
- vibe별(warm/calm/quiet) 스토리 추가

---

## Step 3: 대시보드 페이지 수정

수정 파일: `frontend/src/app/dashboard/page.tsx`

제거 (렌더링에서만, 컴포넌트 파일은 유지):
- AlertBanner, VoiceSummary, StatsRow, CallDurationChart, MoodChart, WeeklyInsight 렌더링
- 하드코딩된 careCards 목 데이터

추가:
- `fetchStoryCards(selectedPid)` 호출
- vibe → mood 매핑: `warm→good, calm→okay, quiet→low`
- 실제 StoryCard 데이터로 CareCard 렌더링
- 빈 상태 UI (카드가 없을 때)

**유틸 함수/컴포넌트:** 모두 `dashboard/page.tsx` 내 인라인으로 정의. 나중에 필요 시 분리.
- `formatDate(cardedAt)` — datetime → "3월 7일" 포맷
- `vibeToMood(vibe)` — warm→good, calm→okay, quiet→low 매핑
- 빈 상태 UI — 별도 컴포넌트 없이 JSX 직접 작성

```tsx
const formatDate = (dt: string) => {
  const d = new Date(dt);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};
const vibeToMood = (vibe: string) =>
  ({ warm: 'good', calm: 'okay', quiet: 'low' }[vibe] ?? 'okay');

const [cards, setCards] = useState<StoryCardData[]>([]);

useEffect(() => {
  if (!selectedPid) return;
  fetchStoryCards(selectedPid).then(setCards);
}, [selectedPid]);

// 렌더링
{cards.length > 0 ? (
  cards.map((card, i) => (
    <CareCard
      date={formatDate(card.cardedAt)}
      mood={vibeToMood(card.data.vibe)}
      summary={card.data.topic}
      quote={card.data.quote}
      isLast={i === cards.length - 1}
    />
  ))
) : (
  <div>
    <p>{t.emptyCards}</p>
    <p>{t.emptyCardsDesc}</p>
  </div>
)}
```

---

## Step 4: i18n 키 추가

수정 파일: `frontend/src/lib/i18n.tsx`
```typescript
// ko:
emptyCards: "아직 이야기 카드가 없어요",
emptyCardsDesc: "어르신과 대화가 시작되면 여기에 이야기가 쌓여요",
// en:
emptyCards: "No story cards yet",
emptyCardsDesc: "Stories will appear here after conversations",
```
