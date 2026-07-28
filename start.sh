#!/usr/bin/env bash
# Starts the n8n Docker container (if not already running) and the frontend dev server.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

step() { echo "==> $1"; }

mkdir -p "/c/n8n/screenshots" "/c/n8n/generated" 2>/dev/null || true

step "Checking Docker Desktop is running"
docker_ready=false
for i in $(seq 1 30); do
  if docker info >/dev/null 2>&1; then
    docker_ready=true
    break
  fi
  sleep 2
done
if [ "$docker_ready" = false ]; then
  echo "ERROR: Docker Desktop does not appear to be running. Start Docker Desktop and re-run this script." >&2
  exit 1
fi

if docker ps --filter "name=^n8n$" --format '{{.Names}}' | grep -q '^n8n$'; then
  step "n8n container is already running"
else
  step "Starting n8n container"
  docker run -d --rm --name n8n \
    -p 5678:5678 \
    --shm-size=1gb \
    -e GENERIC_TIMEZONE="Africa/Casablanca" \
    -e TZ="Africa/Casablanca" \
    -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
    -e N8N_RUNNERS_ENABLED=true \
    -e PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser" \
    -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    -e N8N_RESTRICT_FILE_ACCESS_TO="/data/screenshots;/data/generated" \
    -v n8n_data:/home/node/.n8n \
    -v "C:\n8n\screenshots:/data/screenshots" \
    -v "C:\n8n\generated:/data/generated" \
    n8n-puppeteer
fi

step "Waiting for n8n at http://localhost:5678"
ready=false
for i in $(seq 1 60); do
  if curl -sf http://localhost:5678 >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
if [ "$ready" = true ]; then
  step "n8n is up"
else
  echo "WARNING: n8n did not respond within 60s - check 'docker logs n8n'" >&2
fi

if [ ! -d node_modules ]; then
  step "Installing frontend dependencies (npm install)"
  npm install
fi

step "Starting frontend dev server at http://localhost:5173"
npm run dev
