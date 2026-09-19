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
$ApiLogOut = Join-Path $env:TEMP "huflit-campus-api.out.log"
$ApiLogErr = Join-Path $env:TEMP "huflit-campus-api.err.log"

function Show-ApiLogs {
  param([int]$Tail = 40)
  Write-Host "--- API stdout ($ApiLogOut) ---" -ForegroundColor DarkGray
  Get-Content $ApiLogOut -ErrorAction SilentlyContinue | Select-Object -Last $Tail
  Write-Host "--- API stderr ($ApiLogErr) ---" -ForegroundColor DarkGray
  Get-Content $ApiLogErr -ErrorAction SilentlyContinue | Select-Object -Last $Tail
}

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
Write-Host "  API logs $ApiLogOut / $ApiLogErr" -ForegroundColor DarkGray
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

# Wire Ask HUFLIT → EnterpriseRAG key without committing secrets.
# Prefer env AskRag__ApiKey; else sibling ../enterprise-rag/.env RAG_API_KEY; else appsettings.*.local.json
if (-not $env:AskRag__ApiKey) {
  $ragEnvCandidates = @(
    (Join-Path (Split-Path $Root -Parent) "enterprise-rag\.env"),
    "D:\tu_projects\enterprise-rag\.env"
  )
  foreach ($ragEnv in $ragEnvCandidates) {
    if (-not (Test-Path $ragEnv)) { continue }
    $line = Get-Content $ragEnv | Where-Object { $_ -match '^\s*RAG_API_KEY\s*=' } | Select-Object -First 1
    if ($line -match '^\s*RAG_API_KEY\s*=\s*(.+)\s*$') {
      $env:AskRag__ApiKey = $Matches[1].Trim().Trim('"').Trim("'")
      Write-Host ">> AskRag__ApiKey loaded from $ragEnv" -ForegroundColor DarkGray
      break
    }
  }
}

$apiArgs = @(
  "run",
  "--project", (Join-Path $ApiDir "HuflitCampus.Api.csproj"),
  "--no-build",
  "--launch-profile", "http"
)
Remove-Item $ApiLogOut, $ApiLogErr -ErrorAction SilentlyContinue
$apiProc = Start-Process -FilePath "dotnet" -ArgumentList $apiArgs `
  -WorkingDirectory $ApiDir `
  -PassThru -WindowStyle Hidden `
  -RedirectStandardOutput $ApiLogOut `
  -RedirectStandardError $ApiLogErr

$ready = $false
for ($i = 0; $i -lt 90; $i++) {
  if ($apiProc.HasExited) {
    Show-ApiLogs
    Write-Error "API exited early (code $($apiProc.ExitCode)). See $ApiLogOut / $ApiLogErr"
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
  Write-Host ">> API health check timed out — continuing; see logs below" -ForegroundColor DarkYellow
  Show-ApiLogs -Tail 20
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
