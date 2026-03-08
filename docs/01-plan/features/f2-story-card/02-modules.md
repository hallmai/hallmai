# Feature 2 - 모듈: Conversation + Voice 연동 + StoryCard + 배치

## Step 3: Conversation 모듈

생성 파일:

| 파일 | 역할 |
|------|------|
| `backend/src/modules/conversation/conversation.service.ts` | 대화 생성/종료/조회 |
| `backend/src/modules/conversation/conversation.module.ts` | 모듈 정의 |

메서드:
- `create(deviceId: number)`: 대화 시작 레코드 생성
- `end(id: number, transcript: string)`: 종료 시간/duration/transcript 저장
- `findByDeviceAndDateRange(deviceId, start, end)`: 특정 기간 대화 조회

수정 파일: `backend/src/app.module.ts` — ConversationModule 추가

---

## Step 4: Voice 모듈에 대화 저장 연동

수정 파일:
- `backend/src/modules/voice/voice.module.ts` — ConversationModule import
- `backend/src/modules/voice/voice.gateway.ts` — ConversationService 주입
- `backend/src/modules/voice/voice.service.ts` — 세션 상태에 transcript 수집 추가

변경 로직:
1. `start` 이벤트 수신 시 → `conversationService.create(device.id)` 호출
2. Gemini의 텍스트 트랜스크립션 콜백에서 transcript 누적
3. `end` 이벤트 또는 disconnect 시 → `conversationService.end(id, transcript)` 호출

---

## Step 5: StoryCard 모듈 + API

생성 파일:

| 파일 | 역할 |
|------|------|
| `backend/src/modules/story-card/story-card.service.ts` | 카드 생성/조회 |
| `backend/src/modules/story-card/story-card.controller.ts` | 가족용 카드 조회 API |
| `backend/src/modules/story-card/story-card.module.ts` | 모듈 정의 |

StoryCardController:
- `GET /api/story-cards/:devicePid` (JWT 필수) — 연결된 시니어의 카드 목록 조회

StoryCardService:
- `create(deviceId, cardedAt, data)`: 카드 생성
- `findByDeviceId(deviceId, limit)`: 카드 목록 조회
- `existsForDate(deviceId, cardedAt)`: 중복 방지

수정 파일:
- `backend/src/modules/device/device.module.ts` — DeviceService exports 추가
- `backend/src/app.module.ts` — StoryCardModule 추가

---

## Step 6: 카드 생성 배치

패키지 설치:
```bash
cd backend
yarn add @nestjs/schedule date-fns
```

생성 파일: `backend/src/modules/story-card/card-generator.service.ts`

수정 파일:
- `backend/src/app.module.ts` — `ScheduleModule.forRoot()` 추가
- `backend/src/modules/story-card/story-card.module.ts` — CardGeneratorService 등록

```typescript
@Cron('0 10 * * *', { timeZone: 'Asia/Seoul' })
async generateDailyCards() {
  // 1. linkedAt이 있는 모든 Device 조회 (가족 연결 이전 대화는 카드 생성 대상 아님)
  // 2. 각 Device: 어제 카드 존재하면 skip
  // 3. 어제 완료된 Conversation 조회 → 없으면 skip
  // 4. transcript 합산 → Gemini Text API로 topic/quote/vibe 생성
  // 5. StoryCard 저장
}
```

Gemini 프롬프트 — 카드 데이터 생성:
```
대화 기록을 바탕으로 가족에게 보여줄 카드를 만들어주세요.
- topic: 대화 주제 한 문장 요약
- quote: 어르신 실제 발화 인용
- vibe: warm / calm / quiet 중 하나
포함 금지: 건강 세부(증상, 약 이름), 가족 갈등, 금전 관련
JSON으로만 응답: {"topic": "...", "quote": "...", "vibe": "..."}
```
