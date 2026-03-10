#!/bin/bash

# hallmai 로컬 개발 서버 원클릭 시작 스크립트
# PostgreSQL(Docker) + Backend(NestJS) + Frontend(Next.js)

set -euo pipefail

# Prepare log directory and clear previous logs
mkdir -p logs
> logs/backend.log
> logs/frontend.log

# Kill existing dev servers
echo "Killing existing servers..."
lsof -ti :3000 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
lsof -ti :4000 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
sleep 0.5

BACKEND_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ "${STOP_DB:-false}" = "true" ]; then
    docker compose down
  fi
  echo "Done."
}

trap cleanup EXIT INT TERM

# 1. Start PostgreSQL (wait for healthcheck)
echo "Starting PostgreSQL..."
docker compose up -d --wait
echo "PostgreSQL is ready."

# 2. Start backend (background)
echo "Starting backend..."
(cd backend && yarn start:dev 2>&1 | tee ../logs/backend.log) &
BACKEND_PID=$!
sleep 2
if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo "ERROR: Backend failed to start. Check logs above."
  exit 1
fi

# 3. Start frontend (foreground)
echo "Starting frontend..."
cd frontend
exec yarn dev 2>&1 | tee ../logs/frontend.log
