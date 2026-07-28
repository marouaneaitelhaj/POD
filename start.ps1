#requires -version 5.1
# Starts the n8n Docker container (if not already running) and the frontend dev server.
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

foreach ($dir in @('C:\n8n\screenshots', 'C:\n8n\generated')) {
  if (-not (Test-Path $dir)) {
    Write-Step "Creating $dir"
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
}

Write-Step "Checking Docker Desktop is running"
$dockerReady = $false
for ($i = 0; $i -lt 30; $i++) {
  docker info 2>$null 1>$null
  if ($LASTEXITCODE -eq 0) { $dockerReady = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $dockerReady) {
  Write-Error "Docker Desktop does not appear to be running. Start Docker Desktop and re-run this script."
  exit 1
}

$running = docker ps --filter "name=^n8n$" --format "{{.Names}}" 2>$null
if ($running -eq 'n8n') {
  Write-Step "n8n container is already running"
} else {
  Write-Step "Starting n8n container"
  docker run -d --rm --name n8n `
    -p 5678:5678 `
    --shm-size=1gb `
    -e GENERIC_TIMEZONE="Africa/Casablanca" `
    -e TZ="Africa/Casablanca" `
    -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true `
    -e N8N_RUNNERS_ENABLED=true `
    -e PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser" `
    -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true `
    -e N8N_RESTRICT_FILE_ACCESS_TO="/data/screenshots;/data/generated" `
    -v n8n_data:/home/node/.n8n `
    -v "C:\n8n\screenshots:/data/screenshots" `
    -v "C:\n8n\generated:/data/generated" `
    n8n-puppeteer | Out-Null
}

Write-Step "Waiting for n8n at http://localhost:5678"
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:5678" -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch {}
  Start-Sleep -Seconds 1
}
if (-not $ready) {
  Write-Warning "n8n did not respond within 60s - check 'docker logs n8n'"
} else {
  Write-Step "n8n is up"
}

if (-not (Test-Path (Join-Path $RepoRoot 'node_modules'))) {
  Write-Step "Installing frontend dependencies (npm install)"
  npm install
}

Write-Step "Starting frontend dev server at http://localhost:5173"
npm run dev
