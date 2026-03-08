# Plan: v0.2 MVP - 실시간 음성대화 + 이야기카드 + 대시보드

## v0.2 MVP 완료 기준

1. 어르신이 버튼을 눌러 AI와 실제 음성 대화를 할 수 있다 → **F1**
2. 전날 대화가 끝나면 다음날 오전 10시에 카드가 자동 생성된다 → **F2**
3. 가족이 홈 화면에서 이야기 카드를 볼 수 있다 → **F3**

---

## Feature Plans

### F1: 실시간 음성 대화 (의존성: 없음)

| 문서 | 내용 |
|------|------|
| [f1-realtime-voice/00-overview.md](f1-realtime-voice/00-overview.md) | 요약, 아키텍처, 리스크, 검증 |
| [f1-realtime-voice/01-backend.md](f1-realtime-voice/01-backend.md) | Step 1~2: 패키지 + Voice 모듈 |
| [f1-realtime-voice/02-frontend.md](f1-realtime-voice/02-frontend.md) | Step 3~6: 오디오 + Call 페이지 + 진입흐름 |

### F2: 이야기 카드 자동 생성 (의존성: F1)

| 문서 | 내용 |
|------|------|
| [f2-story-card/00-overview.md](f2-story-card/00-overview.md) | 요약, 아키텍처, 리스크, 검증 |
| [f2-story-card/01-entities.md](f2-story-card/01-entities.md) | Step 1~2: Conversation + StoryCard 엔티티 |
| [f2-story-card/02-modules.md](f2-story-card/02-modules.md) | Step 3~6: 모듈 + Voice 연동 + 배치 |

### F3: 가족 대시보드 실데이터 (의존성: F2)

| 문서 | 내용 |
|------|------|
| [f3-dashboard/00-overview.md](f3-dashboard/00-overview.md) | 요약, 리스크, 검증 |
| [f3-dashboard/01-implementation.md](f3-dashboard/01-implementation.md) | Step 1~4: API + CareCard + 대시보드 + i18n |

---

## Out of Scope

- Soul 설정 (F-08) — 최소한의 시스템 프롬프트만 사용
- 대화 요약 고도화 — 기본 프롬프트만
- 감정 분석 — vibe는 Gemini 판단에 위임
- 푸시 알림 — v0.3 스코프
- `/senior` 페이지 삭제 — 유지 (직접 URL 접근 가능)
- F-19 음성 API 폴백 — 정상 통신 전제, 장애 대응은 이후
- F-20 시니어 오류 UX — 연결 실패/끊김 시 맞춤 피드백은 이후
- F-21 카드 필터링 강화 — 프롬프트 필터링만, 키워드 후처리는 이후
- F-22 침묵 감지 자동 종료 — 수동 종료 버튼만 제공
