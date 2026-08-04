#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Cách 2 — Chạy full stack bằng Docker Compose
.EXAMPLE
  .\scripts\docker-up.ps1
  .\scripts\docker-up.ps1 -Detach
  .\scripts\docker-up.ps1 -Down
#>
param(
  [switch]$Detach,
  [switch]$Down,
  [switch]$NoBuild
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is required. Install Docker Desktop."
}

Set-Location $Root

if ($Down) {
  Write-Host ">> docker compose down..." -ForegroundColor Yellow
  docker compose down
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host " HUFLIT Campus — Cách 2 (Docker Compose)" -ForegroundColor Cyan
Write-Host "  SQL   localhost:1433" -ForegroundColor DarkGray
Write-Host "  API   http://localhost:5080" -ForegroundColor DarkGray
Write-Host "  Web   http://localhost:5173" -ForegroundColor DarkGray
Write-Host ""

$composeArgs = @("compose", "up")
if (-not $NoBuild) { $composeArgs += "--build" }
if ($Detach) { $composeArgs += "-d" }

Write-Host ">> docker $($composeArgs -join ' ')..." -ForegroundColor Yellow
& docker @composeArgs
exit $LASTEXITCODE
