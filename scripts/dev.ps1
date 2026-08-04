#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Cách 1 — Local: ASP.NET API (dotnet) + frontend (pnpm run dev)
.EXAMPLE
  .\scripts\dev.ps1
  .\scripts\dev.ps1 -SkipInstall
#>
param(
  [switch]$SkipInstall,
  [int]$ApiPort = 5080,
  [int]$WebPort = 5173
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $Root "src\backend\HuflitCampus.Api"
$Frontend = Join-Path $Root "src\frontend"
$ApiLog = Join-Path $env:TEMP "huflit-campus-api.log"

function Assert-Command($Name, $Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Error "$Name is required. $Hint"
  }
}

Assert-Command dotnet "Install: https://dotnet.microsoft.com/download"
Assert-Command pnpm "Install: npm install -g pnpm"

Write-Host ""
Write-Host " HUFLIT Campus — Cách 1 (dotnet + pnpm)" -ForegroundColor Cyan
Write-Host "  API     http://localhost:$ApiPort" -ForegroundColor DarkGray
Write-Host "  Web     http://localhost:$WebPort" -ForegroundColor DarkGray
Write-Host "  Swagger http://localhost:$ApiPort/swagger" -ForegroundColor DarkGray
Write-Host "  API log $ApiLog" -ForegroundColor DarkGray
Write-Host ""

Push-Location (Join-Path $Root "src\backend")
try {
  Write-Host ">> dotnet restore + build..." -ForegroundColor Yellow
  dotnet restore HuflitCampus.sln
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  dotnet build HuflitCampus.sln -c Debug --no-restore
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
  Pop-Location
}

if (-not $SkipInstall) {
  Write-Host ">> pnpm install..." -ForegroundColor Yellow
  Push-Location $Frontend
  try {
    pnpm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  }
  finally {
    Pop-Location
  }
}

Write-Host ">> Starting API..." -ForegroundColor Yellow
$apiArgs = @(
  "run",
  "--project", (Join-Path $ApiDir "HuflitCampus.Api.csproj"),
  "--no-build",
  "--launch-profile", "http"
)
$apiProc = Start-Process -FilePath "dotnet" -ArgumentList $apiArgs `
  -WorkingDirectory $ApiDir `
  -PassThru -WindowStyle Hidden `
  -RedirectStandardOutput $ApiLog `
  -RedirectStandardError $ApiLog

$ready = $false
for ($i = 0; $i -lt 90; $i++) {
  if ($apiProc.HasExited) {
    Get-Content $ApiLog -ErrorAction SilentlyContinue | Select-Object -Last 40
    Write-Error "API exited early (code $($apiProc.ExitCode)). See $ApiLog"
  }
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$ApiPort/health" -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
}

if ($ready) {
  Write-Host ">> API healthy on :$ApiPort" -ForegroundColor Green
} else {
  Write-Host ">> API health check timed out — continuing; see $ApiLog" -ForegroundColor DarkYellow
}

function Stop-Api {
  if ($apiProc -and -not $apiProc.HasExited) {
    Write-Host "`n>> Stopping API (PID $($apiProc.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue
  }
}

try {
  Write-Host ">> pnpm run dev (Ctrl+C to stop)..." -ForegroundColor Yellow
  Push-Location $Frontend
  try {
    pnpm exec vite --host --port $WebPort
  }
  finally {
    Pop-Location
  }
}
finally {
  Stop-Api
}
