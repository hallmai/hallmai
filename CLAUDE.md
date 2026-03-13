# hallmai

고령 부모를 위한 AI 음성 말벗 서비스 (v0.2 MVP 개발 단계)

## 프로젝트 구조

- `frontend/` — Next.js 16 + React 19 + TypeScript (App Router)
- `backend/` — NestJS 11 + TypeORM + PostgreSQL
- `docs/` — 기획서

## 개발 환경

- 패키지 매니저: yarn
- 로컬 전체 실행: `./start-local.sh`
- 로그 확인: `logs/backend.log`, `logs/frontend.log`
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
- TypeORM + PostgreSQL
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

### (main) Route Group (공유 레이아웃)
- `/call` — 통화 (시니어/가족 공용)
- `/stories` — 이야기 피드 (가족 전용)
- `/settings` — 설정

### 인증
- `/login` — 로그인
- `/auth/register` — 회원가입

### 공통
- `/` — 진입점 (토큰 유무로 리다이렉트)
- `/terms` — 이용약관
- `/privacy` — 개인정보처리방침
- `/marketing-terms` — 마케팅 약관

## 브랜치 & 배포 규칙

### 마이너 릴리스 (0.x → 0.y)
- main에서 `feat/MMDD-기능명` 브랜치 생성, 기능 개발
- 릴리스 시 main에서 `release/0.y` 생성 → package.json 버전 업데이트
- 포함할 feat만 release에 머지 → 통합 테스트
- main 머지 → 태그 `v0.y.0` → release/feat 브랜치 삭제

### 패치 릴리스 (핫픽스)
- main에서 직접 fix → 태그 `v0.y.1`
- release 브랜치 존재 시 핫픽스를 release에도 즉시 머지

### 브랜치 네이밍
- `feat/MMDD-기능명`, `fix/MMDD-버그명`, `release/버전`

### 배포
- 앱: GitHub Actions (main push 시 자동)
- 인프라: Terraform 수동 (`cd infra && terraform apply`), main 직접 커밋
- **main push 전 반드시 로컬 빌드 검증**: `cd backend && yarn build` + `cd frontend && yarn build`

### 기타
- worktree 작업: WorktreeCreate hook이 backend/.env를 자동 복사함
- 머지 완료된 브랜치는 삭제
- feat 브랜치는 주기적으로 main rebase/merge
- 미포함 feat는 다음 릴리스 전 main rebase
- release 테스트는 로컬 환경

## 문서

- docs/specs/v0.2.md — v0.2 MVP 기획서
- docs/features.md — 피쳐 목록 (F-01 ~ F-25)
