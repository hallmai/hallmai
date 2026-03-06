# 시니어-자녀 온보딩 플로우

## 개요

시니어(어르신)는 구글 로그인이 어려우므로 **디바이스 ID 기반 인증**을 사용하고,
자녀가 구글 로그인 후 **연결 코드**로 시니어 디바이스를 자신의 계정에 링크한다.

## 역할 구분

| 역할 | 인증 방식 | 메인 화면 |
|------|----------|----------|
| 시니어 | 디바이스 ID (로그인 불필요) | `/call` - 통화 화면 |
| 자녀 | 구글 로그인 | `/dashboard` - 안부 대시보드 |

## 온보딩 흐름

### 시니어 플로우

1. 앱 접속 → 역할 선택 화면에서 **"어르신"** 선택
2. 디바이스 ID 자동 생성 + **6자리 연결 코드** 발급
3. 화면에 QR코드 + 6자리 숫자 코드 표시
4. 자녀가 연결할 때까지 대기 (폴링)
5. 연결 완료 → `/call` 화면으로 이동

### 자녀 플로우

1. 앱 접속 → **"가족"** 선택 → 구글 로그인
2. 시니어의 QR 스캔 또는 6자리 코드 직접 입력
3. 연결 완료 → `/dashboard` 화면으로 이동

## API 설계 (안)

```
POST   /api/device/register       — 시니어 디바이스 등록 + 연결 코드 생성
POST   /api/device/link           — 자녀가 코드로 시니어 디바이스를 자기 계정에 링크
GET    /api/device/status/:code   — 시니어가 연결 상태 폴링
```

### POST /api/device/register

- Request: `{ deviceId: string }` (프론트에서 UUID 생성)
- Response: `{ code: "A3F82K", expiresAt: "..." }`

### POST /api/device/link

- Header: `Authorization: Bearer <자녀 JWT>`
- Request: `{ code: "A3F82K" }`
- Response: `{ seniorDeviceId: "...", linkedAt: "..." }`

### GET /api/device/status/:code

- Response: `{ linked: boolean, childName?: string }`

## 연결 코드 규칙

- 6자리 영숫자 (대문자 + 숫자)
- 유효기간: 30분
- 1회 사용 후 만료

## 추후 고려사항

- 한 자녀 계정에 여러 시니어 연결 가능
- 한 시니어에 여러 자녀 연결 가능 (가족 그룹)
- 연결 해제 기능
- 디바이스 변경 시 재연결 플로우
