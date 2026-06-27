#!/usr/bin/env bash
# ============================================================
# dev.sh — convenience wrapper for the Home Bartender AI stack
# ------------------------------------------------------------
# Mirrors the Makefile targets for environments without `make`.
#
# Usage:
#   scripts/dev.sh up         # build + start the full stack (detached)
#   scripts/dev.sh down       # stop the stack (keep data)
#   scripts/dev.sh reset      # stop + wipe volumes (DESTROYS data)
#   scripts/dev.sh logs [svc] # follow logs (optionally one service)
#   scripts/dev.sh ps         # service status
#   scripts/dev.sh config     # render + validate compose config
#   scripts/dev.sh seed       # run backend DB seed (npm run seed in backend)
#   scripts/dev.sh test-all   # run backend + web + app test suites
#   scripts/dev.sh apk <aab>  # convert a release AAB to a universal APK
#   scripts/dev.sh shots [check|update]  # visual-regression baselines
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ensure_env() {
  if [ ! -f .env ]; then
    echo "[dev] .env missing; creating from templates (edit secrets before use)."
    cat .env.example infra/.env.example > .env
  fi
}

CMD="${1:-help}"; shift || true
case "$CMD" in
  up)       ensure_env; docker compose up -d --build ;;
  down)     docker compose down ;;
  reset)    docker compose down -v ;;
  logs)     docker compose logs -f "$@" ;;
  ps)       docker compose ps ;;
  config)   ensure_env; docker compose config ;;
  seed)     docker compose exec backend sh -lc 'npm run seed --if-present' ;;
  test-all)
    echo "== backend ==";  [ -f backend/package.json ] && (cd backend && npm ci && npm test --if-present) || echo "skip backend"
    echo "== web ==";      [ -f web/package.json ]     && (cd web && npm ci && npm test --if-present) || echo "skip web"
    echo "== app ==";      [ -f app/pubspec.yaml ]     && (cd app && flutter pub get && flutter test) || echo "skip app"
    ;;
  apk)      "$ROOT/scripts/aab-to-apk.sh" "$@" ;;
  shots)    "$ROOT/scripts/screenshot-baseline.sh" "$@" ;;
  help|-h|--help) sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//' ;;
  *)        echo "Unknown command: $CMD" >&2; sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'; exit 2 ;;
esac
