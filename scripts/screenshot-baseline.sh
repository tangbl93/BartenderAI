#!/usr/bin/env bash
# ============================================================
# screenshot-baseline.sh — visual regression helper
# ------------------------------------------------------------
# Thin wrapper around the web (Playwright) and app (Flutter golden) visual
# regression flows documented in scripts/screenshot-baseline.md.
#
# Usage:
#   scripts/screenshot-baseline.sh check          # check both surfaces (CI default)
#   scripts/screenshot-baseline.sh update         # regenerate both baselines
#   scripts/screenshot-baseline.sh web [check|update]
#   scripts/screenshot-baseline.sh app [check|update]
#
# Notes:
#   - Pixel baselines are platform-specific. Generate/update them on the
#     SAME OS as CI (Ubuntu Linux) — see screenshot-baseline.md §3.
#   - Web visual tests are expected to run against stub AI providers for
#     determinism (TEXT_PROVIDER=stub / IMAGE_PROVIDER=stub).
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="${ROOT}/web"
APP_DIR="${ROOT}/app"

run_web() {
  local action="${1:-check}"
  if [ ! -f "${WEB_DIR}/package.json" ]; then
    echo "[web] no web/package.json yet — skipping."
    return 0
  fi
  echo "[web] visual snapshots: ${action}"
  cd "$WEB_DIR"
  npx playwright install --with-deps chromium >/dev/null 2>&1 || true
  if [ "$action" = "update" ]; then
    npm run test:visual:update --if-present || npx playwright test tests/visual --update-snapshots
  else
    npm run test:visual --if-present || npx playwright test tests/visual
  fi
}

run_app() {
  local action="${1:-check}"
  if [ ! -f "${APP_DIR}/pubspec.yaml" ]; then
    echo "[app] no app/pubspec.yaml yet — skipping."
    return 0
  fi
  echo "[app] golden tests: ${action}"
  cd "$APP_DIR"
  flutter pub get
  if [ "$action" = "update" ]; then
    flutter test --update-goldens
  else
    flutter test
  fi
}

CMD="${1:-check}"
case "$CMD" in
  check)            run_web check;  run_app check ;;
  update)           run_web update; run_app update ;;
  web)              run_web "${2:-check}" ;;
  app)              run_app "${2:-check}" ;;
  -h|--help|help)   sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//' ;;
  *)                echo "Unknown command: $CMD" >&2; echo "Try: check | update | web | app | help" >&2; exit 2 ;;
esac
