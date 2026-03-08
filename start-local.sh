#!/bin/bash

# hallmai 로컬 개발 서버 원클릭 시작 스크립트
# MySQL(Docker) + Backend(NestJS) + Frontend(Next.js)

set -euo pipefail

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

# 1. Start MySQL (wait for healthcheck)
echo "Starting MySQL..."
docker compose up -d --wait
echo "MySQL is ready."

# 2. Start backend (background)
echo "Starting backend..."
(cd backend && yarn start:dev) &
BACKEND_PID=$!
sleep 2
if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo "ERROR: Backend failed to start. Check logs above."
  exit 1
fi

# 3. Start frontend (foreground)
echo "Starting frontend..."
cd frontend
exec yarn dev
