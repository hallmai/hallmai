# Feature 1: 실시간 음성 대화 - Overview

## Executive Summary

| Item | Detail |
|------|--------|
| Feature | 실시간 음성 대화 (v0.2 MVP 완료 기준 #1) |
| Plan Date | 2026-03-08 |
| Scope | Backend Voice 모듈 + Frontend 오디오/WS 모듈 + Call 페이지 연동 |

### Value Delivered

| Perspective | Description |
|-------------|-------------|
| Problem | `/call` 페이지가 setTimeout 데모 UI만 있고 실제 음성 통신 없음 |
| Solution | Gemini Live API 백엔드 중계 + WebSocket + AudioWorklet 오디오 파이프라인 |
| Function UX Effect | 어르신이 버튼 하나로 AI와 실제 음성 대화 가능 |
| Core Value | "어르신이 버튼을 눌러 AI와 실제 음성 대화를 할 수 있다" 충족 |

---

## Architecture

```
[시니어 브라우저]                  [NestJS 백엔드]                 [Gemini Live API]
  마이크 PCM 16kHz ──(WS)──>   VoiceGateway ──(@google/genai)──>  gemini-2.5-flash
  스피커 재생 24kHz <──(WS)──   VoiceService <──(callback)──────  native-audio
```

- 백엔드 중계 방식: API 키 보호, 향후 대화 저장 확장 용이
- 네이티브 WebSocket (ws): Socket.IO 오버헤드 불필요
- 시니어는 비로그인: deviceUuid만으로 세션 시작

---

## 구현 파일 목록

| 구현 문서 | 내용 |
|-----------|------|
| [01-backend.md](01-backend.md) | Step 1~2: 패키지 설치 + Voice 모듈 |
| [02-frontend.md](02-frontend.md) | Step 3~6: 오디오 모듈 + Call 페이지 + 진입흐름 + i18n |

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| `@google/genai` SDK의 `ai.live.connect()`가 Node.js 서버에서 동작 안 할 수 있음 | Step 2에서 조기 검증. 안 되면 `ws`로 직접 연결 |
| Gemini 모델명/버전 변경 가능 | 모델명을 환경변수(`GEMINI_MODEL`)로 관리 |
| iOS Safari AudioContext 제약 | 버튼 클릭(사용자 제스처) 시 생성 |
| `@SubscribeMessage`가 raw WS에서 안 될 수 있음 | `client.on('message', ...)` 직접 등록으로 폴백 |

## Out of Scope (v0.2 이후 피쳐로 분리)

- **F-19 음성 API 폴백**: Gemini Live API 장애 시 Text API + TTS/STT 자동 전환
- **F-20 시니어 오류 UX**: 연결 실패/끊김/재연결 시 어르신 맞춤 피드백
- **F-22 침묵 감지 자동 종료**: 침묵 시 AI 안내 후 자동 종료

v0.2에서는 정상 통신을 전제로 최소 기능만 구현한다.

---

## Verification

1. 백엔드 단독: `wscat -c ws://localhost:4000/ws/voice` → `start` 전송 → `ready` 수신
2. 프론트엔드: `/call` 접속 → 버튼 탭 → 마이크 권한 → connecting → listening
3. E2E: 앱 열기 → /call → 버튼 탭 → AI 음성 대화 → 종료 → idle
4. 인터럽트: AI 발화 중 시니어 말하기 → AI 재생 즉시 중단
5. 에러: 미등록 deviceUuid로 WS 연결 시도 → `4001` 코드로 거절 확인

## Dependencies

### 백엔드 추가 패키지
- `@nestjs/websockets`, `@nestjs/platform-ws` — WebSocket 지원
- `@google/genai` — Gemini API SDK
- `ws`, `@types/ws` — WebSocket 라이브러리

### 환경 변수
- `GEMINI_API_KEY` — Gemini API 키
- `GEMINI_MODEL` (optional) — 모델명 오버라이드
