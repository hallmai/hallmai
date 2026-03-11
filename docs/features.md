# hallmai 피쳐 목록

| # | 기능 | 설명 | 상태 |
|---|---|---|---|
| F-01 | AI 선제 대화 시작 | 매일 정해진 시간에 AI가 먼저 시니어에게 말을 걸어 대화 시작 | backlog |
| F-02 | 지난 대화 기억 | 이전 대화 내용을 기억해서 다음 대화에 이어가기 | backlog |
| F-03 | AI 질문 풀 — 오늘 기반 | 날씨, 계절, 시사 기반으로 AI가 꺼낼 대화 주제 자동 생성 | backlog |
| F-04 | AI 질문 풀 — 개인 기반 | 가족이 입력한 시니어 취미/관심사 기반으로 대화 주제 생성 | backlog |
| F-05 | AI 질문 풀 — 관계 기반 | 가족 구성원 정보를 바탕으로 가족 얘기를 자연스럽게 꺼내는 대화 주제 생성 | backlog |
| F-06 | 대화 종료 트리거 개선 | 침묵 감지 자동 종료, AI 판단 종료 등 다양한 종료 방식 지원 | backlog |
| F-07 | 가족 온보딩 | 시니어 취미, 가족 구성원 정보를 가족이 입력하는 온보딩 화면 | backlog |
| F-08 | Soul 설정 | AI 호칭, 인사말, 대화 톤 등 가족이 커스터마이징 | backlog |
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
| F-20 | 시니어 오류 UX | 연결 실패·끊김·재연결 시 시니어 맞춤 피드백 (큰 글씨, 음성 안내) | backlog |
| F-21 | 카드 필터링 강화 | 프롬프트 외 키워드 후처리 필터 + 민감 정보 탐지 2차 방어 | backlog |
| F-22 | 침묵 감지 자동 종료 | 일정 시간 침묵 시 AI가 종료 안내 후 자동 대화 종료 | backlog |
| F-23 | Capacitor 네이티브 빌드 | iOS TestFlight + Android APK 배포. Capacitor 8 기반 네이티브 래핑 | backlog |
| F-24 | 대화 transcript 정상 저장 | inputAudioTranscription/outputAudioTranscription으로 실제 대화 저장, thinking 별도 보존 | dev |
| F-25 | 디바이스 등록 중복 에러 개선 | 동시 register 요청 시 device_uuid duplicate key 에러 로그 제거, upsert 패턴 적용 | backlog |
