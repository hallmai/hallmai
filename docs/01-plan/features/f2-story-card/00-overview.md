# Feature 2: 이야기 카드 자동 생성 - Overview

## Executive Summary

| Item | Detail |
|------|--------|
| Feature | 이야기 카드 자동 생성 (v0.2 MVP 완료 기준 #2) |
| Plan Date | 2026-03-08 |
| Scope | Conversation/StoryCard 엔티티 + Voice 연동 + Cron 배치 + 카드 API |
| Depends On | Feature 1 (실시간 음성 대화) |

### Value Delivered

| Perspective | Description |
|-------------|-------------|
| Problem | 음성 대화 내용이 저장되지 않고, 가족에게 공유할 수단 없음 |
| Solution | 대화 transcript DB 저장 + 매일 10시 Gemini로 카드 자동 생성 |
| Function UX Effect | 전날 대화 끝나면 다음날 오전 10시에 이야기 카드 자동 생성 |
| Core Value | "전날 대화가 끝나면 다음날 오전 10시에 카드가 자동 생성된다" 충족 |

---

## Architecture

```
[음성 대화 종료]
  → VoiceGateway가 Conversation 레코드 저장 (transcript 포함)

[매일 10시 Cron]
  → CardGeneratorService
    → 전날 대화가 있는 Device 조회
    → Conversation.transcript 합산
    → Gemini Text API로 topic/quote/vibe 생성 (필터링 적용)
    → StoryCard 저장
```

---

## 구현 파일 목록

| 구현 문서 | 내용 |
|-----------|------|
| [01-entities.md](01-entities.md) | Step 1~2: Conversation + StoryCard 엔티티 |
| [02-modules.md](02-modules.md) | Step 3~6: Conversation 모듈 + Voice 연동 + StoryCard 모듈 + 배치 |

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| Gemini 트랜스크립션 품질 낮을 수 있음 | 카드 생성 프롬프트에서 보정, 빈약하면 skip |
| 카드 생성 결과가 JSON 형식 안 따를 수 있음 | `text.match(/\{[\s\S]*\}/)` JSON 추출 + 파싱 실패 시 skip |
| DB synchronize: false에서 테이블 생성 필요 | 개발 중 일시적으로 synchronize: true 또는 수동 테이블 생성 |
| 프롬프트만으로 민감 정보 100% 필터링 불가 | v0.2는 프롬프트 필터링만 적용. 키워드 후처리는 F-21로 분리 |

## Out of Scope (v0.2 이후 피쳐로 분리)

- **F-21 카드 필터링 강화**: 키워드 후처리 필터 + 민감 정보 탐지 2차 방어

v0.2에서는 Gemini 프롬프트 수준의 필터링만 적용한다.

---

## Verification

1. 대화 저장: 음성 대화 후 DB에 Conversation 레코드 + transcript 확인
2. 배치 수동 실행: CardGeneratorService.generateDailyCards() 트리거 → StoryCard 생성
3. 카드 API: `GET /api/story-cards/:devicePid` (JWT) → 카드 목록 응답
4. 중복 방지: 같은 날짜 배치 2회 → 카드 1개만
5. 빈 transcript: 전날 대화가 모두 빈 transcript일 때 → 배치가 해당 Device skip, 카드 생성 안 됨
6. JSON 파싱 실패: Gemini가 비정상 응답 반환 시 → skip 후 에러 로그, 배치 계속 진행

## Dependencies

### 백엔드 추가 패키지
- `@nestjs/schedule` — Cron 배치
- `date-fns` — 날짜 유틸
