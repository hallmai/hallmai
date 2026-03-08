# code-improvement-0.1.2 Analysis Report

> **Analysis Type**: Gap Analysis (Plan vs Implementation)
>
> **Project**: hallmai
> **Version**: 0.1.2
> **Analyst**: gap-detector
> **Date**: 2026-03-08
> **Plan Doc**: [0.1.2-code-improvement.md](../plans/0.1.2-code-improvement.md)

---

## 1. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Phase 1: Security (8 items) | 100% | ✅ |
| Phase 2: Bug/Stability (9 items) | 100% | ✅ |
| Phase 3: Code Quality (8 items) | 100% | ✅ |
| **Overall (25 items)** | **100%** | **✅** |

```
Fully Implemented:   25 / 25 items  (100%)
Partially Implemented: 0 / 25 items  (  0%)
Not Implemented:       0 / 25 items  (  0%)

Weighted Score: 100% (full=100, partial=50, none=0)
```

---

## 2. Detailed Analysis

### Phase 1: Security (8/8 = 100%)

| ID | Item | Status | Evidence |
|----|------|:------:|----------|
| BE-SEC-1 | JWT fallback secret 제거 | ✅ 100% | `jwt.strategy.ts:10-13` -- fallback 제거, `!secret` 시 `throw new Error` |
| BE-SEC-2 | CORS origin 제한 | ✅ 100% | `main.ts:17-20` -- `CORS_ORIGIN` 환경변수 기반 화이트리스트, 기본값 `localhost:3000` |
| BE-SEC-3 | WebSocket 인증 추가 | ✅ 100% | `voice.gateway.ts:34-49` -- `handleConnection`에서 JWT 토큰 검증, 실패 시 `close(4001)` |
| BE-SEC-4 | crypto.randomInt 교체 | ✅ 100% | `device.service.ts:3,118` -- `import { randomInt } from 'crypto'`, `randomInt(chars.length)` 사용 |
| BE-SEC-5 | synchronize 환경 제한 | ✅ 100% | `entity.module.ts:20` -- `synchronize: config.get('NODE_ENV') !== 'production'` |
| BE-SEC-6 | 에러 메시지 노출 차단 | ✅ 100% | `error.filter.ts:40-42` -- `Error` 인스턴스일 때 `message = 'Internal server error'` 고정 |
| FE-SEC-1 | Google Client ID fallback 제거 | ✅ 100% | `providers.tsx:6` -- `|| ""` (빈 문자열 fallback), `next.config.ts:3-5` -- 미설정 시 빌드 차단 (`throw new Error`) |
| FE-SEC-2 | userScalable 허용 | ✅ 100% | `layout.tsx:16-19` -- `viewport`에 `userScalable` 속성 없음 (기본 허용) |

---

### Phase 2: Bug/Stability (9/9 = 100%)

| ID | Item | Status | Evidence |
|----|------|:------:|----------|
| BE-BUG-1 | Object.assign 기본값 오염 | ✅ 100% | `logger.service.ts:23` -- `Object.assign({}, defaultExpressLogParserOptions, options)` (빈 객체 대상) |
| BE-BUG-2 | id_token non-null assertion | ✅ 100% | `auth.service.ts:49-51` -- `if (!tokens.id_token)` null 체크 후 `throw new UnauthorizedException` |
| BE-BUG-3 | 전역 Map을 인스턴스 속성으로 | ✅ 100% | `voice.gateway.ts:24` -- `private readonly clientConversations = new Map<>()` (인스턴스 속성) |
| FE-BUG-1 | JSON.parse try-catch | ✅ 100% | `settings/page.tsx:13-18` -- `getUserSnapshot` 내 `try { JSON.parse } catch { return null }` |
| FE-BUG-2 | API_URL 통합 | ✅ 100% | `config.ts` -- 단일 export, `api.ts:2`, `auth.ts:1`, `voice-client.ts:4`, `use-device.ts:5` 모두 `import { API_URL } from './config'` 사용 |
| FE-BUG-3 | useMemo -> useState+useEffect (또는 useSyncExternalStore) | ✅ 100% | `use-device.ts:30` -- `useSyncExternalStore(subscribe, getDeviceUuidSnapshot, getServerSnapshot)` SSR 안전 패턴 |
| FE-BUG-4 | AudioContext 지연 생성 | ✅ 100% | `audio-player.ts:2,7-15` -- `audioContext: null` 초기화, `ensureContext()` 메서드로 사용 시점 생성 |
| FE-BUG-5 | VoiceClient setTimeout 관리 | ✅ 100% | `voice-client.ts:24,80,132-134` -- `disconnectTimer` 속성 저장, `cleanup()`에서 `clearTimeout` |
| FE-BUG-6 | 만료 토큰 인증 판단 | ✅ 100% | `auth.ts:63-72` -- `isTokenValid()` JWT payload의 `exp` 확인, `page.tsx:11` -- `isTokenValid()` 호출 |

---

### Phase 3: Code Quality (8/8 = 100%)

| ID | Item | Status | Score | Evidence |
|----|------|:------:|:-----:|----------|
| BE-QUAL-1 | 토큰 발급 로직 추출 | ✅ 100% | 100 | `auth.service.ts:194-203` -- `private issueTokens()` 헬퍼 메서드, L115/L128/L152에서 호출 |
| BE-QUAL-2 | 201->200 강제 변환 제거 | ✅ 100% | 100 | `response.interceptor.ts:94-101` -- 상태 코드 강제 변환 로직 없음, `{ data: body }` 래핑만 수행 |
| BE-QUAL-3 | DTO 분리 | ✅ 100% | 100 | `dto/google-login.dto.ts`, `dto/google-register.dto.ts`, `dto/refresh.dto.ts` -- class-validator 데코레이터 적용 |
| BE-QUAL-4 | category enum 검증 | ✅ 100% | 100 | `post.controller.ts:11` -- `@Query('category', new ParseEnumPipe(PostCategory))` 적용 |
| FE-QUAL-1 | 약관 페이지 중복 제거 | ✅ 100% | 100 | `legal-post-page.tsx` -- 공통 컴포넌트, `terms/`, `privacy/`, `marketing-terms/` 모두 사용 |
| FE-QUAL-2 | any 타입 제거 | ✅ 100% | 100 | `auth.ts` -- `AuthUser` 인터페이스 적용, any 없음. `link-senior-prompt.tsx:30` -- `catch (err: unknown)`. `logger.interface.ts:29` -- `[key: string]: unknown`. `logger.service.ts:62` -- `filterParams(params: unknown)`, L129 -- `responseBody: unknown` |
| FE-QUAL-3 | i18n 누락 문자열 | ✅ 100% | 100 | `i18n.tsx` -- en/ko 양쪽에 19개 키 추가. `settings/page.tsx` -- `t.settingsTerms`/`t.settingsPrivacy`/`t.settingsMarketing`/`t.settingsLogout` 사용. `link-senior-prompt.tsx` -- 전체 `t.*` 키 사용 (10+ 문자열). `legal-post-page.tsx` -- `t.legalBack`/`t.legalPreparing`. `auth/register/page.tsx` -- `t[a.labelKey]` 동적 참조 |
| FE-QUAL-4 | API 에러 핸들링 | ✅ 100% | 100 | `api.ts:9-21` -- `apiFetch()` 공통 wrapper 구현. 401 시 `clearAuth()` + `/login` 리다이렉트. `fetchLatestPost`/`fetchLinkedDevices`/`fetchStoryCards`/`linkDevice` 모두 `apiFetch()` 사용 |

---

## 3. Gap Details

v1.0에서 보고된 3건의 Gap이 모두 해소됨.

### 3.1 FE-QUAL-2: any 타입 제거 -- RESOLVED

**v1.0 상태**: `logger.interface.ts:29` `[key: string]: any`, `logger.service.ts:62,129` `any` 잔존
**v1.1 상태**: Plan 명시 파일(`auth.ts`, `link-senior-prompt.tsx`) 및 추가 지정 파일(`logger.interface.ts`, `logger.service.ts`) 모두 `any` -> `unknown` 변경 완료. `typeorm-logger/` 하위의 `any`는 TypeORM `Logger` 인터페이스 구현 제약으로 Plan 범위 외.

---

### 3.2 FE-QUAL-3: i18n 누락 문자열 -- RESOLVED

**v1.0 상태**: `settings/page.tsx`, `link-senior-prompt.tsx`, `legal-post-page.tsx`, `auth/register/page.tsx`에 ~17개 하드코딩 문자열 잔존
**v1.1 상태**: `i18n.tsx`에 en/ko 양쪽 19개 키 추가 완료. 4개 파일 모두 `t.*` 키 참조로 전환. 하드코딩 한국어 문자열 0건.

추가된 i18n 키 목록:
`settingsTerms`, `settingsPrivacy`, `settingsMarketing`, `settingsLogout`, `linkNicknameTitle`, `linkNicknamePlaceholder`, `linkNext`, `linkConnect`, `linkChangeNickname`, `linkCodeDesc`, `linkConnecting`, `linkCodeHint`, `linkFailed`, `legalBack`, `legalPreparing`, `registerTitle`, `registerSubtitle`, `registerAgreeAll`, `registerRequired`, `registerOptional`, `registerMarketingDesc`, `registerSubmitting`, `registerSubmit`

---

### 3.3 FE-QUAL-4: API 에러 핸들링 -- RESOLVED

**v1.0 상태**: 공통 fetch wrapper 미구현, 401 자동 처리 없음
**v1.1 상태**: `api.ts:9-21`에 `apiFetch()` 공통 wrapper 구현. `authHeaders()` 자동 주입 + 401 시 `clearAuth()` + `/login` 리다이렉트. 인증 필요한 4개 API 함수 모두 `apiFetch()` 경유. 인증 전 호출(`apiGoogleLogin`, `apiGoogleRegister`)과 시니어 디바이스 등록(`use-device.ts`)은 인증 불필요하므로 직접 `fetch` 사용 -- 의도된 설계.

---

## 4. Match Rate Summary

```
+----------------------------------------------+
|  Overall Match Rate: 100%                     |
+----------------------------------------------+
|  Phase 1 (Security):     8/8  = 100% (800)   |
|  Phase 2 (Bug/Stability): 9/9 = 100% (900)   |
|  Phase 3 (Code Quality):  8/8 = 100% (800)   |
|                                               |
|  Total: 2500 / 2500 = 100%                   |
+----------------------------------------------+
```

---

## 5. Remaining Notes

### 5.1 Plan 범위 외 참고 사항

| Item | Location | Note |
|------|----------|------|
| typeorm-logger `any` 잔존 | `typeorm-logger.interface.ts:4,12`, `typeorm-logger.ts:8` | TypeORM `Logger` 인터페이스 시그니처 제약. 향후 타입 오버라이드 검토 가능 |
| `use-device.ts` 직접 fetch | `use-device.ts:35` | 시니어 디바이스 등록은 비인증 API이므로 `apiFetch` 미적용이 적절 |

### 5.2 Design Document Update Needed

- Plan 문서의 FE-BUG-3 항목: "useMemo -> useState+useEffect" 표기이나 실제 구현은 `useSyncExternalStore` 사용 (더 나은 접근). Plan 문서 업데이트 권장

---

## 6. Conclusion

전체 25개 항목 모두 완전 구현으로 **100% Match Rate** 달성.
보안(Phase 1), 버그 수정(Phase 2), 코드 품질(Phase 3) 전 카테고리 100% 완료.

v1.0 대비 개선된 3건:
- FE-QUAL-2: `logger.interface.ts`, `logger.service.ts`의 `any` -> `unknown` 변경
- FE-QUAL-3: 19개 i18n 키 추가 및 4개 파일의 하드코딩 문자열 전면 `t.*` 전환
- FE-QUAL-4: `apiFetch()` 공통 wrapper 구현 (401 자동 처리 + 로그인 리다이렉트)

Match Rate 100% -- **완료 기준 충족**.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-08 | Initial gap analysis (25 items, 94% match rate) | gap-detector |
| 1.1 | 2026-03-08 | Re-verification of 3 partial items (FE-QUAL-2/3/4), all resolved. 100% match rate | gap-detector |
