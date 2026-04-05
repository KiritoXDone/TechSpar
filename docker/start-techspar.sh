#!/bin/bash
set -euo pipefail

ln -sf /usr/share/zoneinfo/${TZ:-Asia/Shanghai} /etc/localtime || true
echo "${TZ:-Asia/Shanghai}" > /etc/timezone || true

BACKEND_PORT=8000
APP_DATA_DIR="${DATA_DIR:-/opt/TechSpar/data}"
MOUNT_DATA_DIR="${MOUNT_DATA_DIR:-/data}"

if [ -d "${MOUNT_DATA_DIR}" ] && [ "${MOUNT_DATA_DIR}" != "${APP_DATA_DIR}" ]; then
  mkdir -p "${MOUNT_DATA_DIR}"
  rm -rf "${APP_DATA_DIR}"
  ln -s "${MOUNT_DATA_DIR}" "${APP_DATA_DIR}"
fi

mkdir -p "${APP_DATA_DIR}" /var/log/nginx /var/lib/nginx /run/nginx

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
