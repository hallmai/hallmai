# Feature 1 - Frontend: 오디오 모듈 + Call 페이지 + 진입흐름

## Step 3: 프론트엔드 오디오 모듈

생성 파일:

| 파일 | 역할 |
|------|------|
| `frontend/public/audio-processor.js` | AudioWorklet — 마이크 PCM 추출 |
| `frontend/src/lib/audio-recorder.ts` | 마이크 캡처 → PCM 16-bit 16kHz → base64 |
| `frontend/src/lib/audio-player.ts` | base64 PCM 24kHz → 스피커 재생, 인터럽트 처리 |
| `frontend/src/lib/voice-client.ts` | WebSocket 연결 + 오디오 송수신 통합 |
| `frontend/src/hooks/use-voice.ts` | VoiceClient를 React 상태로 연결 |
| `frontend/src/hooks/use-device.ts` | 자동 기기 등록 + deviceUuid 관리 |

오디오 사양:

| 방향 | 포맷 | 샘플레이트 | 인코딩 |
|------|------|-----------|--------|
| 마이크 → 서버 | PCM 16-bit mono | 16kHz | base64 |
| 서버 → 스피커 | PCM 16-bit mono | 24kHz | base64 |

### audio-recorder.ts
- `getUserMedia({ audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true } })`
- AudioWorklet으로 PCM 추출 (`audio-processor.js`)
- Float32 → Int16 → base64 변환 후 콜백

### audio-player.ts
- `enqueue(base64)`: 재생 큐에 추가
- `interrupt()`: 현재 재생 중단 + 큐 비우기
- base64 → Int16 → Float32 → AudioBuffer → 스피커

### voice-client.ts
- `connect()`: WebSocket 연결 → `start` 전송 → `ready` 수신 시 마이크 캡처 시작
- `disconnect()`: `end` 전송 → 정리
- 상태: `idle | connecting | listening | speaking | ending`
- `audio` 이벤트 수신 시 → `speaking` 상태 + player.enqueue()
- `interrupted` 수신 시 → `listening` 상태 + player.interrupt()
- 마이크 입력은 세션 동안 항상 서버로 전송 (인터럽트를 Gemini가 처리)

### use-device.ts
현재 `/senior/page.tsx`의 기기등록 로직 추출:
- localStorage에서 `seniorDeviceUuid` 확인 → 없으면 uuid 생성
- `POST /api/device/register` 호출
- `{ deviceUuid, loading }` 반환

---

## Step 4: Call 페이지 연동

수정 파일: `frontend/src/app/call/page.tsx`

변경 내용:
1. 데모 로직 제거: setTimeout 기반 상태 순환 코드 삭제
2. useDevice + useVoice 연결: 실제 WebSocket 기반 상태 관리
3. CallState에 `connecting` 추가: `"idle" | "connecting" | "listening" | "speaking" | "ending"`
4. 좌측 상단 deviceUuid 표시: `deviceUuid.substring(0, 8).toUpperCase()`
5. connecting 상태 UI: idle과 동일한 breathe 애니메이션 + `callConnecting` 라벨
6. 기존 애니메이션/스타일 유지: ripple, breathe, wave bar 모두 그대로

**경쟁 조건 방지:** `useVoice`는 `start()` 호출 시에만 WS 연결을 시작하고, `loading` 중에는 버튼 비활성화하여 기기등록 완료 전 연결을 원천 차단한다.

```tsx
const { deviceUuid, loading } = useDevice();
const { state, error, start, stop } = useVoice(deviceUuid);

const handleTap = () => {
  if (loading) return; // 기기등록 완료 전 차단
  if (state === 'idle') start();
  else if (state === 'listening' || state === 'speaking') stop();
};
```

---

## Step 5: 앱 진입 흐름 변경

수정 파일: `frontend/src/app/page.tsx`

현재: 비로그인 시 어르신/가족 선택 화면
변경: 비로그인 시 `/call`로 즉시 리다이렉트

```typescript
useEffect(() => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    router.push("/dashboard");
  } else {
    router.push("/call");
  }
}, [router]);
```

---

## Step 6: i18n 키 추가

수정 파일: `frontend/src/lib/i18n.tsx`
```typescript
// ko:
callConnecting: "연결 중...",
// en:
callConnecting: "Connecting...",
```
