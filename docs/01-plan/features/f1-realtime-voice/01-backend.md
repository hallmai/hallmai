# Feature 1 - Backend: 패키지 설치 + Voice 모듈

## Step 1: 백엔드 패키지 설치 + 설정

패키지 설치:
```bash
cd backend
yarn add @nestjs/websockets @nestjs/platform-ws @google/genai ws
yarn add -D @types/ws
```

수정 파일:
- `backend/src/main.ts` — WsAdapter 추가:
  ```typescript
  import { WsAdapter } from '@nestjs/platform-ws';
  // app.enableCors() 이후:
  app.useWebSocketAdapter(new WsAdapter(app));
  ```
- `backend/.env` — `GEMINI_API_KEY` 추가

---

## Step 2: Voice 모듈

생성 파일:

| 파일 | 역할 |
|------|------|
| `backend/src/modules/voice/voice.constants.ts` | 시스템 프롬프트, 오디오 설정 상수 |
| `backend/src/modules/voice/voice.service.ts` | Gemini Live API 세션 생성/관리/메시지 중계 |
| `backend/src/modules/voice/voice.gateway.ts` | WebSocket Gateway (`/ws/voice`) |
| `backend/src/modules/voice/voice.module.ts` | 모듈 정의 |

수정 파일:
- `backend/src/app.module.ts` — VoiceModule import 추가

### voice.constants.ts

시스템 프롬프트:
```typescript
export const SYSTEM_PROMPT = `당신은 '할마이'라는 AI 음성 대화 친구입니다.
한국어로 대화합니다. 사용자는 주로 고령의 어르신입니다.
따뜻하고 다정하게 대화하세요.
어르신의 이야기에 공감하고, 적절한 질문으로 대화를 이어가세요.
짧고 명확하게 말하세요.`;
```

### voice.service.ts

핵심 로직:
- `startSession(client, deviceUuid)`: `ai.live.connect()` 호출, 콜백으로 오디오/텍스트/인터럽트 이벤트를 client에 중계
- `sendAudio(client, audioBase64)`: 클라이언트 오디오 → Gemini 전달
- `endSession(client)`: 세션 정리
- 세션 저장: `Map<WebSocket, { geminiSession, deviceUuid }>`

### voice.gateway.ts

WebSocket 메시지 프로토콜:

**클라이언트 → 서버:**

| 이벤트 | 데이터 | 설명 |
|--------|--------|------|
| `start` | `{ deviceUuid }` | 세션 시작 |
| `audio` | `{ data: base64 }` | PCM 16kHz mono 오디오 |
| `end` | `{}` | 세션 종료 |

**서버 → 클라이언트:**

| 이벤트 | 데이터 | 설명 |
|--------|--------|------|
| `ready` | `{}` | Gemini 연결 완료 |
| `audio` | `{ data: base64 }` | AI 응답 오디오 (PCM 24kHz) |
| `interrupted` | `{}` | 인터럽트 발생 |
| `ended` | `{}` | 세션 종료 확인 |
| `error` | `{ message }` | 에러 |

**인증:** deviceUuid로 Device 테이블 조회하여 존재 확인. 없으면 `client.close(4001)`.
