#!/bin/bash

# Cloud SQL Auth Proxy — 로컬에서 운영 DB 접속
# 사용법: ./db-proxy.sh [psql]
#   ./db-proxy.sh        → 프록시만 실행 (포트 5433)
#   ./db-proxy.sh psql   → 프록시 실행 + psql 자동 접속

set -euo pipefail

PORT=5433  # 로컬 PostgreSQL(5432)과 충돌 방지

# GCP 프로젝트 정보 자동 감지
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
INSTANCE="$PROJECT_ID:asia-northeast3:hallmai-db"

if ! command -v cloud-sql-proxy &>/dev/null; then
  echo "cloud-sql-proxy가 설치되어 있지 않습니다."
  echo "  brew install cloud-sql-proxy"
  exit 1
fi

# 인증 상태 확인 — 만료 시 안내
if ! gcloud auth print-access-token &>/dev/null 2>&1; then
  echo "⚠️  GCP 인증이 만료되었습니다. 아래 명령어를 실행하세요:"
  echo ""
  echo "  gcloud auth login"
  echo "  gcloud auth application-default login"
  echo ""
  exit 1
fi

echo "Cloud SQL Proxy 시작: $INSTANCE → localhost:$PORT"
cloud-sql-proxy "$INSTANCE" --port "$PORT" &
PROXY_PID=$!

cleanup() {
  kill "$PROXY_PID" 2>/dev/null || true
  echo "Proxy 종료."
}
trap cleanup EXIT INT TERM

sleep 2

if [ "${1:-}" = "psql" ]; then
  DB_PASS=$(gcloud secrets versions access latest --secret=hallmai-db-password 2>/dev/null)
  PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -p "$PORT" -U hallmai-app -d hallmai
else
  echo "접속: psql -h 127.0.0.1 -p $PORT -U hallmai-app -d hallmai"
  echo "비밀번호: gcloud secrets versions access latest --secret=hallmai-db-password"
  echo ""
  echo "Ctrl+C로 프록시 종료"
  wait "$PROXY_PID"
fi
