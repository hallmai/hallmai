# F-28 + F-38 작업 내용 요약

## 구현 결과

### 백엔드 — 버전 API

- `backend/scripts/build-version.js`: 빌드 시 `build-version.json` 생성 (git tag + MMDDHHmm 타임스탬프)
- `backend/package.json`: `"prebuild": "node scripts/build-version.js"` 추가
- `health.controller.ts`: `GET /api/health` 응답에 `version` 포함
  - 응답 구조: `{ data: { status: 'ok', version: '...' } }`
  - 개발 시 `build-version.json` 없으면 런타임 fallback

### 프론트엔드 — 설정 화면

- `next.config.ts`: `NEXT_PUBLIC_APP_VERSION` 빌드 타임 주입 (같은 git tag + 타임스탬프 형식)
- `api.ts`: `fetchPublic` 추가 (인증 없이 공개 API 호출용)
- `i18n.tsx`: `settingsDeviceId`, `settingsDeviceIdCopied`, `settingsVersionApp`, `settingsVersionApi` 4개 키 추가
- `settings/page.tsx`:
  - `DeviceUuidCard` — `seniorDeviceUuid` 읽어 표시 + 복사 버튼 (게스트 전용)
  - `VersionInfo` — 앱/서버 버전을 한 줄로 표시 (양쪽 모두)

## 이슈 및 해결

| 이슈 | 원인 | 해결 |
|------|------|------|
| Hydration 에러 | `DeviceUuidCard`에서 lazy initializer 사용 → 서버/클라이언트 렌더 불일치 | `useState(null)` + `useEffect` 패턴으로 변경 |
| API 버전 미표시 | 응답 구조 `data.data.version` 인데 `data.version` 으로 읽음 | `data?.data?.version ?? data?.version` 으로 수정 |
| lint 에러 | `set-state-in-effect` 룰 | `DeviceUuidCard`에 `eslint-disable-next-line` 추가 |

## 완료 기준 확인

- [x] 백엔드 빌드 통과
- [x] 프론트엔드 빌드 통과
- [x] 프론트엔드 lint 통과
- [x] 설정 화면에 버전 정보 노출 확인
- [x] 게스트 설정에 디바이스 UUID 노출 확인
