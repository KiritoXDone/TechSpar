#!/bin/bash
set -euo pipefail

ln -sf /usr/share/zoneinfo/${TZ:-Asia/Shanghai} /etc/localtime || true
echo "${TZ:-Asia/Shanghai}" > /etc/timezone || true

BACKEND_PORT=8000

mkdir -p "${DATA_DIR:-/opt/TechSpar/data}" /var/log/nginx /var/lib/nginx /run/nginx

python3 -m uvicorn backend.main:app --host 0.0.0.0 --port "${BACKEND_PORT}" --log-level info &
UVICORN_PID=$!

nginx -g "daemon off;" &
NGINX_PID=$!

cleanup() {
  kill -TERM "${UVICORN_PID:-}" 2>/dev/null || true
  kill -TERM "${NGINX_PID:-}" 2>/dev/null || true
  wait "${UVICORN_PID:-}" 2>/dev/null || true
  wait "${NGINX_PID:-}" 2>/dev/null || true
}

trap cleanup TERM INT

wait
cleanup
