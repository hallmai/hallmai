# F-28 + F-38: 설정 화면 버전/UUID 노출

## Context
설정 페이지에 두 가지 정보를 추가한다:
- **F-38**: 시니어(게스트) 설정에 디바이스 UUID 표시 + 복사 기능
- **F-28**: 설정 하단에 프론트엔드·백엔드 버전 표시 (로그인/비로그인 공통)

**버전 전략 결정사항:**
- 프론트/백 버전을 **분리 표시** (배포가 독립적이므로)
- 버전 소스: **git tag** (`git describe --tags --always`) — package.json 의존 제거
- 포맷: `0.2.6(03150930)` (git 버전 + 빌드 타임스탬프 MMDDHHmm)
- 태그 기반 배포 전환은 별도 작업으로 분리

## 변경 파일 (8개)

### 1. `backend/scripts/build-version.js` — 빌드 시점 버전 생성 (신규)
- `prebuild` 스크립트로 `yarn build` 전에 자동 실행
- `git describe --tags --always` + `new Date()` MMDDHHmm → `build-version.json` 생성

```js
const { execSync } = require('child_process')
const { writeFileSync } = require('fs')
let v = 'unknown'
try { v = execSync('git describe --tags --always', { encoding: 'utf-8' }).trim().replace(/^v/, '') } catch {}
const ts = new Date().toISOString().replace(/[-T:]/g, '').slice(4, 12)
writeFileSync('build-version.json', JSON.stringify({ version: `${v}(${ts})` }))
```

### 2. `backend/package.json` — prebuild 스크립트 추가
```json
"prebuild": "node scripts/build-version.js",
```

### 3. `.gitignore` — build-version.json 제외
```
build-version.json
```

### 4. `backend/src/modules/health/health.controller.ts` — 버전 API
- 빌드 시 생성된 `build-version.json` 읽기
- 파일 없으면 (dev 모드) 런타임 fallback

```ts
import { Controller, Get } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

function loadVersion(): string {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'build-version.json'), 'utf-8')).version
  } catch {}
  // dev fallback
  let v = 'unknown'
  try { v = execSync('git describe --tags --always', { encoding: 'utf-8' }).trim().replace(/^v/, '') } catch {}
  const ts = new Date().toISOString().replace(/[-T:]/g, '').slice(4, 12)
  return `${v}(${ts})`
}

const version = loadVersion()

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', version }
  }
}
```

### 5. `frontend/next.config.ts` — 빌드타임 버전 주입
- `next.config.ts`는 `yarn build` 시 실행되므로 정확한 빌드 시점
- `git describe --tags --always`로 버전, `new Date()`로 타임스탬프

```ts
import type { NextConfig } from "next";
import { execSync } from "child_process";

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is required");
}

function getBuildVersion(): string {
  let git = "unknown";
  try {
    git = execSync("git describe --tags --always", { encoding: "utf-8" }).trim().replace(/^v/, "");
  } catch {}
  const ts = new Date().toISOString().replace(/[-T:]/g, "").slice(4, 12);
  return `${git}(${ts})`;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getBuildVersion(),
  },
};

export default nextConfig;
```

### 6. `frontend/src/lib/i18n.tsx` — 번역 키 추가
`settingsLoginLoading` 키 아래에 추가:

| 키 | EN | KO |
|---|---|---|
| `settingsDeviceId` | Device ID | 기기 ID |
| `settingsDeviceIdCopied` | Copied! | 복사됨! |
| `settingsVersionApp` | App | 앱 |
| `settingsVersionApi` | API | 서버 |

### 7. `frontend/src/app/(main)/settings/page.tsx` — UI 변경 (핵심)

**7a. GuestSettings에 디바이스 UUID 카드 추가 (F-38)**
- `useState` + `useEffect`로 `localStorage.getItem('seniorDeviceUuid')` 읽기
  - `useDevice()` 훅은 device register API 부작용이 있어 사용 안 함
- 복사: `navigator.clipboard.writeText()` + 2초간 "복사됨!" 표시
- 위치: Login Prompt Card 아래, LegalLinks 위

**7b. VersionInfo 내부 컴포넌트 추가 (F-28)**
- 프론트엔드: `process.env.NEXT_PUBLIC_APP_VERSION` (빌드타임 주입)
- 백엔드: `useEffect`로 `GET /api/health` → `version` 추출 (실패 시 미표시)
- 위치: LoggedInSettings / GuestSettings 모두 최하단
- 스타일: `text-[11px] text-stone-300 text-center`
- 표시 예: `앱 0.2.6(03150930) · 서버 0.2.6(03151000)`

**최종 구조:**
```
LoggedInSettings
├── Profile Card (기존)
├── LegalLinks (기존)
├── 로그아웃 버튼 (기존)
└── VersionInfo (신규)

GuestSettings
├── Login Prompt Card (기존)
├── Device UUID Card (신규 F-38)
├── LegalLinks (기존)
└── VersionInfo (신규 F-28)
```

### 8. `docs/features.md` — Done으로 이동
F-28, F-38을 Backlog → Done 섹션으로 이동.

## 검증
1. `cd backend && yarn build` — 빌드 성공 확인
2. `cd frontend && yarn build` — 빌드 성공 확인
3. `cd frontend && yarn lint` — 린트 통과 확인
4. 로컬 실행 후 수동 확인:
   - 게스트 설정: UUID 카드 표시 + 복사 동작
   - 로그인 설정: 버전 표시
   - `GET /api/health` → version 필드에 `0.2.6(...)` 형태 확인
