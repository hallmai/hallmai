# hallmai TODO

## 완료

- [x] NestJS 백엔드 세팅 (인터셉터, 로깅, config)
- [x] MySQL + TypeORM + Transactional
- [x] Google 로그인 + 회원가입 (약관 동의 포함)
- [x] Post 엔티티 (약관/개인정보/마케팅 API)
- [x] 로고 제작 및 적용
- [x] 설정 페이지 + 로그아웃
- [x] AppShell 레이아웃 통일
- [x] 온보딩 플로우 문서화
- [x] 역할 선택 UI (어르신 폰 / 내 폰)
- [x] 시니어 디바이스 등록 + 6자리 연결코드 발급
- [x] Device API (register, link, status, linked)
- [x] 소리 전송 (SoundTransmitter/Receiver) + 수동 코드 입력
- [x] 자녀가 코드 입력 → 시니어 디바이스 연결
- [x] 라우트 정리 (/demo → /dashboard, /settings, /call)
- [x] 주간 대화 시간 라인차트
- [x] 어머니/아버지 복수 시니어 지원 (nickname, 탭 셀렉터)

## TODO

### 핵심 기능 (심사 필수)
- [ ] `/call` 음성대화 — Gemini Live API 연동
- [ ] 감정 감지 + 공감/정보 모드 자동 전환
- [ ] 안부 카드 자동 생성 + DB 저장
- [ ] 가족 대시보드 실데이터 연결 (현재 데모 하드코딩)

### 부가 기능
- [ ] 음성 브리핑 (어제의 안부 요약 TTS)
- [ ] AI 선제 연락 (매일 정해진 시간 스케줄링)
- [ ] 날씨/생활정보 function calling
- [ ] 닉네임/Soul 설정 실제 저장

### 인프라
- [ ] Google Cloud Console localhost:3000 승인 출처 추가
- [ ] Google Cloud Run 배포
