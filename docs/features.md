# hallmai 피쳐 목록

## Done (22)

| # | 기능 | 설명 |
|---|------|------|
| F-02 | 지난 대화 기억 | 대화 종료 시 요약 자동 생성, 다음 대화 시스템 프롬프트에 최근 2회 요약 주입 |
| F-03 | AI 질문 풀 — 오늘 기반 | F-30 구글 검색으로 흡수 |
| F-04 | AI 질문 풀 — 개인 기반 | Soul 프로필의 관심사/취미가 시스템 프롬프트에 주입되어 대화 주제로 활용 |
| F-20 | 시니어 오류 UX | 연결 실패·끊김·재연결 시 시니어 맞춤 피드백 (큰 글씨, 음성 안내) |
| F-22 | 침묵 감지 자동 종료 | 일정 시간 침묵 시 AI가 종료 안내 후 자동 대화 종료 |
| F-23 | Capacitor 네이티브 빌드 | Capacitor 8 + safe area + StatusBar + 앱 아이콘 |
| F-24 | 대화 transcript 정상 저장 | inputAudioTranscription/outputAudioTranscription으로 실제 대화 저장, thinking 별도 보존 |
| F-25 | 디바이스 등록 중복 에러 개선 | 동시 register 요청 시 upsert 패턴 적용 |
| F-29 | Soul 엔진 | transcript에서 Soul 프로필(관심사, 가족관계, 일상패턴, 감정경향, 대화선호) 자동 추출/업데이트 |
| F-30 | 대화 중 구글 검색 | Gemini Live API `googleSearch` Tool Use로 대화 중 실시간 검색 |
| F-31 | 대화 중 유튜브 검색 | Gemini Live API 커스텀 function + YouTube Data API로 영상 검색/재생 |
| F-33 | 구조화 로깅 (Cloud Run) | Winston JSON 포맷 통합. NestLoggerAdapter, bufferLogs |
| F-34 | Gemini JSON 모드 전환 | Soul 엔진·카드 생성기를 responseMimeType: 'application/json'으로 교체 |
| F-35 | GeminiProvider 전역화 | 3개 모듈 중복 등록 → @Global() GeminiModule 통합 |
| F-36 | Prompt Injection 방어 | 카드 생성기에 transcript 격리 태그 및 지시문 무시 경고 추가 |
| F-37 | Soul 성숙도 기반 프롬프트 | explore/bonding/friend 3단계 시스템 프롬프트 분화 |
| F-39 | 음성 볼륨 버튼 맥동 | listening/speaking 중 마이크 RMS 볼륨 기반 버튼 scale 맥동 + 노이즈 게이트 |
| F-40 | RNNoise 노이즈 서프레션 | @sapphi-red/web-noise-suppressor WASM 기반 노이즈 제거 + 설정 토글 |
| F-42a | 핫키 그리드·인터럽트·VAD | lucide-react 아이콘 핫키 그리드, 클라이언트 인터럽트, silenceDurationMs 500ms, 인사 mute |
| F-41 | 관계 정립 (호칭/말투) | explore 단계에서 호칭 질문, Soul에 callerName/speechStyle 저장, 기본 존댓말 |
| F-42 | 대화 요약에 일시 포함 | 상대 시간 라벨(오늘/어제/N일 전), AI가 시간 감각에 맞는 응답 생성 |
| F-43 | 장기 대화 세션 갱신 | 10턴마다 Gemini 세션 교체, 요약+Soul 유지, 사용자에게 투명 |
| F-44 | 카메라 핫키 | 사진 찍어서 AI에게 보여주고 대화 시작. Gemini Live API sendClientContent inlineData |

## Backlog — Ready (16)

선행 피쳐 모두 완료, 바로 착수 가능.

| # | 기능 | 설명 | 선행 |
|---|------|------|------|
| F-01 | AI 선제 대화 시작 | 매일 정해진 시간에 AI가 먼저 시니어에게 말을 걸어 대화 시작 | — |
| F-05 | AI 질문 풀 — 관계 기반 | Soul에서 자동 추출된 가족 관계 정보로 가족 얘기를 자연스럽게 꺼냄 | F-29 ✅ |
| F-06 | 대화 종료 트리거 개선 | 침묵 감지 위에 AI 판단 종료 등 다양한 종료 방식 추가 | F-22 ✅ |
| F-07 | 가족 온보딩 | 가족 연결(코드 입력) 전용 온보딩 화면 | — |
| F-09 | 음성 브리핑 | 이야기 카드 요약을 TTS로 가족에게 들려주기 | — |
| F-14 | 주간 인사이트 | AI가 한 주 대화를 분석해 가족에게 요약 카드 제공 | F-24 ✅ |
| F-15 | vibe enum 개선 | 부정 감정을 포함한 vibe 스펙트럼 재설계 | — |
| F-16 | 기기 변경 시 프로필 이전 | 시니어 기기 교체/재설치 시 UUID 기반 연결 유지 | — |
| F-17 | 소리 기반 자동 연결 | 가족 폰 소리 송출 → 시니어 폰 감지 → 자동 연결 | F-23 ✅ |
| F-18 | 앱스토어 배포 | iOS App Store / Android Play Store 정식 배포 | F-23 ✅ |
| F-19 | 음성 API 폴백 | Gemini Live API 장애 시 Text API + TTS/STT 조합 자동 전환 | — |
| F-21 | 카드 필터링 강화 | 키워드 후처리 필터 + 민감 정보 탐지 2차 방어 | — |
| F-26 | 실시간 대화 자막 | 통화 중 시니어 화면에 AI/사용자 대화를 실시간 자막 표시 | F-24 ✅ |
| F-27 | 음성 통화 시뮬레이터 | 마이크 없이 텍스트로 음성 통화를 테스트하는 개발 도구 | — |
| F-28 | 설정 UI 버전 노출 | 설정 화면에서 프론트엔드·백엔드 버전 표시 | — |
| F-38 | 설정 디바이스 UUID 노출 | 시니어(게스트) 설정 화면에 디바이스 UUID 표시 | — |

## Backlog — Blocked (4)

| # | 기능 | 설명 | 대기 중 |
|---|------|------|---------|
| F-10 | 다중 가족 구성원 | 여러 가족이 각자 계정으로 같은 시니어 홈 화면 확인 | F-07 |
| F-11 | 가족 답장/사진 전송 | 가족이 홈 화면에서 시니어에게 메시지/사진 보내기 | F-07, F-10 |
| F-12 | 시니어 앱 연결 가족 확인/해제 | 시니어 설정에서 연결된 가족 목록 확인 및 해제 | F-07, F-10 |
| F-13 | 주간 vibe 차트 | 7일간 vibe 변화를 가족 홈 화면에 시각화 | F-15 |
