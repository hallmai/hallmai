# hallmai 피쳐 목록

| # | 기능 | 설명 | 상태 |
|---|---|---|---|
| F-01 | AI 선제 대화 시작 | 매일 정해진 시간에 AI가 먼저 시니어에게 말을 걸어 대화 시작 | backlog |
| F-02 | 지난 대화 기억 | 대화 종료 시 요약 자동 생성, 다음 대화 시스템 프롬프트에 최근 3회 요약 주입 | done |
| F-03 | AI 질문 풀 — 오늘 기반 | F-30 구글 검색으로 흡수. Gemini가 날씨/뉴스를 자체 검색하여 대화에 활용 | done |
| F-04 | AI 질문 풀 — 개인 기반 | Soul 프로필의 관심사/취미가 시스템 프롬프트에 주입되어 대화 주제로 활용 | done |
| F-05 | AI 질문 풀 — 관계 기반 | Soul에서 자동 추출된 가족 관계 정보를 바탕으로 가족 얘기를 자연스럽게 꺼내는 대화 주제 생성 | backlog |
| F-06 | 대화 종료 트리거 개선 | 침묵 감지 자동 종료, AI 판단 종료 등 다양한 종료 방식 지원 | backlog |
| F-07 | 가족 온보딩 | 가족 연결(코드 입력)만 수행하는 온보딩 화면. 시니어 정보는 Soul 엔진이 자동 수집 | backlog |
| F-08 | Soul 설정 | AI 호칭, 인사말, 대화 톤 등 가족이 커스터마이징 | hold |
| F-09 | 음성 브리핑 | 이야기 카드 요약을 TTS로 가족에게 들려주기 | backlog |
| F-10 | 다중 가족 구성원 | 여러 가족이 각자 계정으로 같은 시니어의 홈 화면 확인 | backlog |
| F-11 | 가족 답장/사진 전송 | 가족이 홈 화면에서 시니어에게 메시지/사진 보내기 | backlog |
| F-12 | 시니어 앱 연결 가족 확인/해제 | 시니어 앱 설정에서 연결된 가족 목록 확인 및 해제 가능 | backlog |
| F-13 | 주간 vibe 차트 | 7일간 vibe 변화를 가족 홈 화면에 시각화 | backlog |
| F-14 | 주간 인사이트 | AI가 한 주 대화를 분석해 가족에게 요약 카드 제공 | backlog |
| F-15 | vibe enum 개선 | 부정 감정을 포함한 vibe 스펙트럼 재설계 | backlog |
| F-16 | 기기 변경 시 프로필 이전 | 시니어가 기기를 바꾸거나 앱을 재설치해도 기존 UUID 기반 연결 유지 | backlog |
| F-17 | 소리 기반 자동 연결 | 시니어와 가족이 함께 있을 때, 가족 폰에서 소리 송출 → 시니어 폰이 감지 → 자동 연결 | backlog |
| F-18 | 앱스토어 배포 | iOS App Store / Android Play Store 정식 배포 | backlog |
| F-19 | 음성 API 폴백 | Gemini Live API 장애 시 Text API + TTS/STT 조합으로 자동 전환 | backlog |
| F-20 | 시니어 오류 UX | 연결 실패·끊김·재연결 시 시니어 맞춤 피드백 (큰 글씨, 음성 안내) | done |
| F-21 | 카드 필터링 강화 | 프롬프트 외 키워드 후처리 필터 + 민감 정보 탐지 2차 방어 | backlog |
| F-22 | 침묵 감지 자동 종료 | 일정 시간 침묵 시 AI가 종료 안내 후 자동 대화 종료 | done |
| F-23 | Capacitor 네이티브 빌드 | iOS TestFlight + Android APK 배포. Capacitor 8 기반 네이티브 래핑 | backlog |
| F-24 | 대화 transcript 정상 저장 | inputAudioTranscription/outputAudioTranscription으로 실제 대화 저장, thinking 별도 보존 | done |
| F-25 | 디바이스 등록 중복 에러 개선 | 동시 register 요청 시 device_uuid duplicate key 에러 로그 제거, upsert 패턴 적용 | done |
| F-26 | 실시간 대화 자막 | 통화 중 시니어 화면에 AI/사용자 대화를 실시간 자막으로 표시 | backlog |
| F-27 | 음성 통화 시뮬레이터 | 마이크 없이 텍스트로 음성 통화를 테스트할 수 있는 개발 도구 | backlog |
| F-28 | 설정 UI 버전 노출 | 설정 화면에서 프론트엔드·백엔드 각각의 버전을 표시 | backlog |
| F-29 | Soul 엔진 | 대화 종료 시 transcript에서 Soul 프로필(관심사, 가족관계, 일상패턴, 감정경향, 대화선호) 자동 추출/업데이트. 다음 대화 시스템 프롬프트에 주입 | done |
| F-30 | 대화 중 구글 검색 | Gemini Live API `googleSearch` Tool Use로 대화 중 실시간 검색. F-03 흡수 | done |
| F-31 | 대화 중 유튜브 검색 | Gemini Live API 커스텀 function + YouTube Data API로 대화 중 유튜브 검색 | backlog |
| F-32 | 시니어 친화 VAD 설정 | Gemini Live API VAD 민감도를 고령자 음성 특성에 맞춰 조정. startOfSpeech/endOfSpeech LOW, prefixPadding 400ms, silenceDuration 2000ms | done |
| F-33 | 구조화 로깅 (Cloud Run) | NestJS 전체 로그를 Winston JSON 포맷으로 통합. NestLoggerAdapter, bufferLogs, AllExceptionsFilter console.error 제거 | done |
| F-34 | Gemini JSON 모드 전환 | Soul 엔진·카드 생성기의 regex 기반 JSON 파싱을 responseMimeType: 'application/json'으로 교체 | done |
| F-35 | GeminiProvider 전역화 | 3개 모듈에서 중복 등록된 GeminiProvider를 @Global() GeminiModule로 통합 | done |
| F-36 | Prompt Injection 방어 | 카드 생성기에 transcript 격리 태그 및 지시문 무시 경고 추가 | done |

## 피쳐 의존관계

| 피쳐 | 선행 피쳐 | 비고 |
|------|----------|------|
| F-01 | — | v1은 독립, F-04/F-05 있으면 맥락적 인사 가능 |
| F-02 | F-24 ✅, F-29 ✅ | ✅ done. 대화 요약 생성 + 시스템 프롬프트 주입 |
| F-03 | F-30 ✅ | ✅ done. F-30 구글 검색으로 흡수 |
| F-04 | F-29 ✅ | ✅ done. Soul 프로필 관심사 → 시스템 프롬프트 |
| F-05 | F-29 | Soul 엔진에서 자동 추출된 가족 관계 필요 |
| F-06 | F-22 ✅ | 침묵 감지 위에 AI 판단 종료 추가 |
| F-07 | — | 가족 연결 전용: F-10, F-11, F-12 해제 |
| F-08 | — | hold — Soul 자동 형성으로 가족 커스터마이징 불필요 |
| F-09 | — | TTS 독립 구현 |
| F-10 | F-07 | 다중 가족 계정 연결 |
| F-11 | F-07, F-10 | 가족 연결 후 메시지/사진 전송 |
| F-12 | F-07, F-10 | 가족 연결 후 관리 UI |
| F-13 | F-15 | vibe enum 확장 후 차트 구현 |
| F-14 | F-24 ✅ | 저장된 대화 데이터로 주간 분석 |
| F-15 | — | vibe enum 재설계 |
| F-16 | — | UUID 기반 독립 구현 |
| F-17 | F-23 | 네이티브 오디오 API 필요 |
| F-18 | F-23 | 네이티브 빌드 필요 |
| F-19 | — | Text API + TTS/STT 폴백 |
| F-20 | — | ✅ done |
| F-21 | — | 후처리 필터 독립 구현 |
| F-22 | — | ✅ done |
| F-23 | — | **핵심 블로커**: F-17, F-18 해제 |
| F-24 | — | ✅ done |
| F-25 | — | ✅ done |
| F-26 | F-24 ✅ | transcript 저장 인프라 위에 실시간 UI 추가 |
| F-27 | — | 개발 도구, 독립 |
| F-28 | — | health API에 version 추가 + 설정 UI |
| F-29 | F-24 ✅ | **핵심 블로커**: F-02, F-04, F-05 해제. transcript 기반 Soul 프로필 추출 |
| F-30 | — | ✅ done. Gemini Live config에 `tools: [{googleSearch: {}}]` 추가 |
| F-31 | — | 독립, YouTube Data API 키 필요 |
| F-32 | — | ✅ done. 고령자 음성 연구 기반 값 설정 |
| F-33 | — | ✅ done |
| F-34 | F-29 ✅ | ✅ done. Soul 엔진·카드 생성기 JSON 파싱 개선 |
| F-35 | — | ✅ done |
| F-36 | F-29 ✅ | ✅ done. Soul 엔진은 기존 적용, 카드 생성기에 추가 |
