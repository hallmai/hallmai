# hallmai

고령 부모를 위한 AI 음성 말벗 서비스 (v0.2 MVP 개발 단계)

## 프로젝트 구조

- `frontend/` — Next.js 16 + React 19 + TypeScript (App Router)
- `backend/` — NestJS 11 + TypeORM + MySQL
- `docs/` — 기획서

## 개발 환경

- 패키지 매니저: yarn
- 프론트엔드 실행: `cd frontend && yarn dev`
- 프론트엔드 린트: `cd frontend && yarn lint`
- 백엔드 실행: `cd backend && yarn start:dev`
- 백엔드 린트: `cd backend && yarn lint`
- Storybook: `cd frontend && yarn storybook`

## 기술 스택

### 프론트엔드
- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 (외부 UI 라이브러리 없음)
- Storybook (컴포넌트 개발/테스트)
- Capacitor 8 (모바일)

### 백엔드
- NestJS 11, TypeScript
- TypeORM + MySQL
- JWT + Passport (인증)
- Google Auth (소셜 로그인)

## 디자인 규칙

- 팔레트: stone + coral + emerald/amber/red (blue/violet/purple 금지)
- 페이지 배경: #FFF8F0
- 모바일 프레임 430px 기준
- 외부 UI 라이브러리 금지, heavy shadow 금지

## 코드 컨벤션

- 컴포넌트: PascalCase (파일명은 kebab-case)
- i18n: Context API 기반, 모든 사용자 노출 텍스트는 i18n 처리
- 다국어: 한국어(기본) + 영어

## 주요 경로 (프론트엔드)

### 시니어 플로우
- `/senior` — 시니어 통화 화면
- `/call` — 음성 대화

### 가족 플로우
- `/login` — 로그인
- `/auth/register` — 회원가입
- `/dashboard` — 가족 홈 (이야기 카드)
- `/settings` — 설정

### 공통
- `/` — 랜딩
- `/terms` — 이용약관
- `/privacy` — 개인정보처리방침
- `/marketing-terms` — 마케팅 약관

## 문서

- docs/hallmai-spec.md — v0.2 MVP 기획서
