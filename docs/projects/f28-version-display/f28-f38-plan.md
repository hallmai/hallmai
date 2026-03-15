# F-28 + F-38 작업 계획서

## 개요

| 항목 | 내용 |
|------|------|
| 기능 | F-28 설정 UI 버전 노출 + F-38 설정 디바이스 UUID 노출 |
| 위치 | 설정 화면 하단 |
| 대상 | 시니어(게스트) 설정, 로그인(가족) 설정 |

## 구현 범위 (8개 파일)

| 파일 | 작업 |
|------|------|
| `backend/scripts/build-version.js` | 신규 — 빌드 시 버전 JSON 생성 스크립트 |
| `backend/package.json` | `prebuild` 스크립트 추가 |
| `backend/src/modules/health/health.controller.ts` | `/api/health` 응답에 `version` 필드 추가 |
| `frontend/next.config.ts` | `NEXT_PUBLIC_APP_VERSION` 빌드 타임 주입 |
| `frontend/src/lib/i18n.tsx` | 4개 i18n 키 추가 |
| `frontend/src/lib/api.ts` | `fetchPublic` 유틸 추가 |
| `frontend/src/app/(main)/settings/page.tsx` | `DeviceUuidCard`, `VersionInfo` 컴포넌트 추가 |
| `docs/features.md` | F-28, F-38 Done으로 이동 |

## 버전 전략

- **프론트엔드**: `next.config.ts`에서 빌드 시 `git describe --tags --always` + `MMDDHHmm` 타임스탬프
- **백엔드**: `prebuild` 스크립트로 `build-version.json` 생성 → `/api/health` 응답에 포함
  - 개발 환경: `build-version.json` 없으면 런타임 git describe + 현재 타임스탬프 fallback

## UI 배치

```
[NoiseSuppressionToggle]   ← 기존 (수정 안 함)
[DeviceUuidCard]           ← F-38 (게스트 전용)
[LegalLinks]
[LogoutButton]             ← 로그인 전용
[VersionInfo]              ← F-28 (양쪽 모두)
```

## 주의 사항

- `NoiseSuppressionToggle` 하단에 추가 (기존 컴포넌트 수정 없음)
- `DeviceUuidCard`: localStorage 읽기는 `useEffect` 패턴 사용 (hydration safe)
- `VersionInfo`: 둘 다 없으면 렌더링 안 함
