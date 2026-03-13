#!/bin/bash

# hallmai 로컬 개발 서버 원클릭 시작 스크립트
# PostgreSQL(Docker) + Backend(NestJS) + Frontend(Next.js)
# 모든 로그가 색깔+이름 프리픽스로 한 터미널에 출력됨

set -euo pipefail

# Prepare log directory and clear previous logs
mkdir -p logs
> logs/backend.log
> logs/frontend.log

# Kill existing dev servers (port listeners + nest/next process trees)
echo "Killing existing servers..."
lsof -ti :3000 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
lsof -ti :4000 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
pkill -f "nest start --watch" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 0.5

cleanup() {
  echo ""
  echo "Shutting down..."
  # Kill entire process group so no orphans remain
  pkill -f "nest start --watch" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
  lsof -ti :3000 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
  lsof -ti :4000 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
  if [ "${STOP_DB:-false}" = "true" ]; then
    docker compose down
  fi
  echo "Done."
}

trap cleanup EXIT INT TERM

# 1. Start PostgreSQL (free port 5432, clean up orphans, wait for healthcheck)
echo "Starting PostgreSQL..."
docker compose down --remove-orphans 2>/dev/null || true
# Stop any other container using port 5432
OTHER_PG=$(docker ps --filter "publish=5432" -q 2>/dev/null)
if [ -n "$OTHER_PG" ]; then
  echo "Stopping other container on port 5432..."
  docker stop $OTHER_PG 2>/dev/null || true
fi
docker compose up -d --wait
echo "PostgreSQL is ready."

# 2. Start backend + frontend with concurrently
npx concurrently \
  --names "be,fe" \
  --prefix-colors "cyan,magenta" \
  --prefix "[{name}]" \
  --kill-others-on-fail \
  "cd backend && yarn start:dev 2>&1 | tee ../logs/backend.log" \
  "cd frontend && yarn dev 2>&1 | tee ../logs/frontend.log"
