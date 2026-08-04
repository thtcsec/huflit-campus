#!/usr/bin/env bash
# Cách 1 — Local: ASP.NET API (dotnet) + frontend (pnpm run dev)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/src/backend/HuflitCampus.Api"
FRONTEND="$ROOT/src/frontend"
API_PORT="${API_PORT:-5080}"
WEB_PORT="${WEB_PORT:-5173}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"
API_LOG="${TMPDIR:-/tmp}/huflit-campus-api.log"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1 — $2" >&2; exit 1; }; }
need dotnet "https://dotnet.microsoft.com/download"
need pnpm "npm install -g pnpm"

echo ""
echo " HUFLIT Campus — Cách 1 (dotnet + pnpm)"
echo "  API     http://localhost:$API_PORT"
echo "  Web     http://localhost:$WEB_PORT"
echo "  Swagger http://localhost:$API_PORT/swagger"
echo ""

echo ">> dotnet restore + build..."
(cd "$ROOT/src/backend" && dotnet restore HuflitCampus.sln && dotnet build HuflitCampus.sln -c Debug --no-restore)

if [[ "$SKIP_INSTALL" != "1" ]]; then
  echo ">> pnpm install..."
  (cd "$FRONTEND" && pnpm install)
fi

cleanup() {
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    echo ""
    echo ">> Stopping API (PID $API_PID)..."
    kill "$API_PID" 2>/dev/null || true
    wait "$API_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo ">> Starting API..."
(
  cd "$API_DIR"
  export ASPNETCORE_ENVIRONMENT=Development
  export ASPNETCORE_URLS="http://localhost:$API_PORT"
  dotnet run --project HuflitCampus.Api.csproj --no-build --launch-profile http
) >"$API_LOG" 2>&1 &
API_PID=$!

ready=0
for _ in $(seq 1 90); do
  if ! kill -0 "$API_PID" 2>/dev/null; then
    tail -n 40 "$API_LOG" || true
    echo "API exited early. See $API_LOG" >&2
    exit 1
  fi
  if curl -fsS "http://localhost:$API_PORT/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [[ "$ready" -eq 1 ]]; then
  echo ">> API healthy on :$API_PORT"
else
  echo ">> API health check timed out — continuing; see $API_LOG"
fi

echo ">> pnpm run dev (Ctrl+C to stop)..."
cd "$FRONTEND"
pnpm exec vite --host --port "$WEB_PORT"
