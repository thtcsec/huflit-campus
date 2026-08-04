#!/usr/bin/env bash
# Cách 2 — Full stack với Docker Compose
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

command -v docker >/dev/null 2>&1 || { echo "Docker is required." >&2; exit 1; }

if [[ "${1:-}" == "down" ]]; then
  echo ">> docker compose down..."
  docker compose down
  exit 0
fi

DETACH=0
NO_BUILD=0
for arg in "$@"; do
  case "$arg" in
    -d|--detach) DETACH=1 ;;
    --no-build) NO_BUILD=1 ;;
  esac
done

echo ""
echo " HUFLIT Campus — Cách 2 (Docker Compose)"
echo "  SQL   localhost:1433"
echo "  API   http://localhost:5080"
echo "  Web   http://localhost:5173"
echo ""

ARGS=(compose up)
[[ "$NO_BUILD" -eq 0 ]] && ARGS+=(--build)
[[ "$DETACH" -eq 1 ]] && ARGS+=(-d)

echo ">> docker ${ARGS[*]}..."
docker "${ARGS[@]}"
