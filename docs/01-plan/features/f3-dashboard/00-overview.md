# Feature 3: 가족 대시보드 실데이터 - Overview

## Executive Summary

| Item | Detail |
|------|--------|
| Feature | 가족 대시보드 실데이터 (v0.2 MVP 완료 기준 #3) |
| Plan Date | 2026-03-08 |
| Scope | API 클라이언트 + CareCard 수정 + 대시보드 페이지 수정 |
| Depends On | Feature 2 (이야기 카드 자동 생성) |

### Value Delivered

| Perspective | Description |
|-------------|-------------|
| Problem | 대시보드가 하드코딩 목데이터만 표시, 스펙에 없는 UI 컴포넌트 존재 |
| Solution | StoryCard API 연동 + 불필요 컴포넌트 제거 + 빈 상태 UI |
| Function UX Effect | 가족이 로그인 후 실제 이야기 카드를 대시보드에서 확인 |
| Core Value | "가족이 홈 화면에서 이야기 카드를 볼 수 있다" 충족 |

---

## Architecture

```
[NestJS 백엔드]                          [프론트엔드]
  GET /api/story-cards/:devicePid  →  fetchStoryCards()
                                        → useState<StoryCardData[]>
                                        → CareCard 컴포넌트 렌더링
                                        → 빈 상태 시 EmptyState
```

- F2에서 만든 StoryCard API를 호출하여 실데이터 표시
- 목 데이터 및 스펙에 없는 UI 컴포넌트(AlertBanner, MoodChart 등) 제거

---

## 구현 파일 목록

| 구현 문서 | 내용 |
|-----------|------|
| [01-implementation.md](01-implementation.md) | Step 1~4: API + CareCard + 대시보드 + i18n |

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| Storybook stories가 props 변경으로 깨질 수 있음 | care-card.stories.tsx 업데이트 |
| 대시보드 레이아웃이 컴포넌트 제거로 허전해질 수 있음 | 카드 타임라인 중심으로 레이아웃 재배치 |

---

## Verification

1. 카드 표시: Feature 2 카드가 대시보드에 표시
2. 빈 상태: 카드 없는 시니어 선택 → 빈 상태 UI
3. vibe 매핑: warm/calm/quiet → 올바른 mood 아이콘/색상
4. 다중 시니어: 탭 전환 시 해당 시니어 카드만 표시
5. v0.2 전체 E2E: 음성 대화 → 배치 → 가족 로그인 → 대시보드 카드 확인

## Dependencies

추가 패키지 없음. F2의 StoryCard API만 사용.
