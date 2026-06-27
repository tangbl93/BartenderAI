#!/usr/bin/env bash
# ============================================================
# aab-to-apk.sh — convert a Flutter release AAB to installable APK(s)
# ------------------------------------------------------------
# Produces a UNIVERSAL APK from an Android App Bundle using Google's
# bundletool. Downloads bundletool automatically if it isn't already on
# PATH or cached. Optionally installs to a connected device via adb.
#
# Signing:
#   Pass keystore credentials via flags OR environment variables. NEVER
#   hard-code secrets. If no keystore is given, bundletool signs the
#   universal APK with its debug key (fine for internal test installs,
#   NOT for Play upload).
#
# Usage:
#   scripts/aab-to-apk.sh <path/to/app-release.aab> [options]
#
# Options:
#   -o, --out DIR         Output dir (default: alongside the .aab)
#   -k, --keystore PATH   Path to .jks/.keystore (or env: AAB_KEYSTORE)
#   -a, --key-alias NAME  Key alias                (or env: AAB_KEY_ALIAS)
#       --install         adb install the universal APK to a device
#   -h, --help            Show this help
#
# Passwords are read ONLY from the environment (never flags, never echoed):
#   AAB_STORE_PASSWORD    keystore password
#   AAB_KEY_PASSWORD      key password (defaults to AAB_STORE_PASSWORD)
#
# Examples:
#   # Debug-signed universal APK for quick internal testing:
#   scripts/aab-to-apk.sh app/build/app/outputs/bundle/release/app-release.aab
#
#   # Release-signed + install to device:
#   export AAB_STORE_PASSWORD=... AAB_KEY_PASSWORD=...
#   scripts/aab-to-apk.sh app-release.aab \
#       -k ~/keys/bartender.jks -a bartender --install
#
# Build the AAB first with:
#   cd app && flutter build appbundle --release
# ============================================================
set -euo pipefail

BUNDLETOOL_VERSION="1.18.1"
CACHE_DIR="${HOME}/.cache/bundletool"
BUNDLETOOL_JAR="${CACHE_DIR}/bundletool-all-${BUNDLETOOL_VERSION}.jar"
BUNDLETOOL_URL="https://github.com/google/bundletool/releases/download/${BUNDLETOOL_VERSION}/bundletool-all-${BUNDLETOOL_VERSION}.jar"

usage() { sed -n '2,46p' "$0" | sed 's/^# \{0,1\}//'; }

# ---- parse args ----
AAB=""
OUT_DIR=""
KEYSTORE="${AAB_KEYSTORE:-}"
KEY_ALIAS="${AAB_KEY_ALIAS:-}"
DO_INSTALL=false

while [ $# -gt 0 ]; do
  case "$1" in
    -o|--out)        OUT_DIR="$2"; shift 2 ;;
    -k|--keystore)   KEYSTORE="$2"; shift 2 ;;
    -a|--key-alias)  KEY_ALIAS="$2"; shift 2 ;;
    --install)       DO_INSTALL=true; shift ;;
    -h|--help)       usage; exit 0 ;;
    -*)              echo "Unknown option: $1" >&2; usage; exit 2 ;;
    *)               if [ -z "$AAB" ]; then AAB="$1"; else echo "Unexpected arg: $1" >&2; exit 2; fi; shift ;;
  esac
done

if [ -z "$AAB" ]; then
  echo "ERROR: no AAB path given." >&2
  usage
  exit 2
fi
if [ ! -f "$AAB" ]; then
  echo "ERROR: AAB not found: $AAB" >&2
  exit 1
fi

# ---- require java ----
if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: 'java' is required to run bundletool. Install a JDK (17+)." >&2
  exit 1
fi

# ---- resolve bundletool ----
BT_CMD=""
if command -v bundletool >/dev/null 2>&1; then
  # Homebrew wrapper or similar.
  BT_CMD="bundletool"
else
  if [ ! -f "$BUNDLETOOL_JAR" ]; then
    echo "[aab-to-apk] bundletool not found; downloading v${BUNDLETOOL_VERSION} ..."
    mkdir -p "$CACHE_DIR"
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL "$BUNDLETOOL_URL" -o "$BUNDLETOOL_JAR"
    elif command -v wget >/dev/null 2>&1; then
      wget -qO "$BUNDLETOOL_JAR" "$BUNDLETOOL_URL"
    else
      echo "ERROR: need curl or wget to download bundletool." >&2
      exit 1
    fi
    echo "[aab-to-apk] cached at $BUNDLETOOL_JAR"
  fi
  BT_CMD="java -jar ${BUNDLETOOL_JAR}"
fi

# ---- output paths ----
AAB_DIR="$(cd "$(dirname "$AAB")" && pwd)"
AAB_BASE="$(basename "$AAB" .aab)"
OUT_DIR="${OUT_DIR:-$AAB_DIR}"
mkdir -p "$OUT_DIR"
APKS_PATH="${OUT_DIR}/${AAB_BASE}.apks"
EXTRACT_DIR="${OUT_DIR}/${AAB_BASE}-apk"

# ---- assemble signing flags (only if a keystore was supplied) ----
SIGN_FLAGS=()
if [ -n "$KEYSTORE" ]; then
  if [ ! -f "$KEYSTORE" ]; then
    echo "ERROR: keystore not found: $KEYSTORE" >&2
    exit 1
  fi
  if [ -z "$KEY_ALIAS" ]; then
    echo "ERROR: --key-alias / AAB_KEY_ALIAS is required when a keystore is given." >&2
    exit 1
  fi
  if [ -z "${AAB_STORE_PASSWORD:-}" ]; then
    echo "ERROR: AAB_STORE_PASSWORD env var is required when signing." >&2
    exit 1
  fi
  KEY_PASSWORD="${AAB_KEY_PASSWORD:-$AAB_STORE_PASSWORD}"
  SIGN_FLAGS=(
    --ks="$KEYSTORE"
    --ks-pass="pass:${AAB_STORE_PASSWORD}"
    --ks-key-alias="$KEY_ALIAS"
    --key-pass="pass:${KEY_PASSWORD}"
  )
  echo "[aab-to-apk] signing with keystore: $KEYSTORE (alias: $KEY_ALIAS)"
else
  echo "[aab-to-apk] WARNING: no keystore supplied — universal APK will be debug-signed."
  echo "             Use only for internal testing, not Play Store upload."
fi

# ---- build universal APK set ----
echo "[aab-to-apk] building universal APK set -> $APKS_PATH"
rm -f "$APKS_PATH"
# shellcheck disable=SC2086
$BT_CMD build-apks \
  --bundle="$AAB" \
  --output="$APKS_PATH" \
  --mode=universal \
  --overwrite \
  "${SIGN_FLAGS[@]}"

# ---- extract universal.apk ----
echo "[aab-to-apk] extracting universal.apk -> $EXTRACT_DIR"
rm -rf "$EXTRACT_DIR"
mkdir -p "$EXTRACT_DIR"
unzip -o "$APKS_PATH" -d "$EXTRACT_DIR" >/dev/null
UNIVERSAL_APK="${EXTRACT_DIR}/universal.apk"
if [ ! -f "$UNIVERSAL_APK" ]; then
  # Some bundletool versions nest under universal/ — find it.
  UNIVERSAL_APK="$(find "$EXTRACT_DIR" -name 'universal.apk' | head -n1)"
fi
if [ -z "$UNIVERSAL_APK" ] || [ ! -f "$UNIVERSAL_APK" ]; then
  echo "ERROR: universal.apk not found in $EXTRACT_DIR" >&2
  exit 1
fi

echo ""
echo "[aab-to-apk] DONE"
echo "  universal APK: $UNIVERSAL_APK"

# ---- optional install ----
if [ "$DO_INSTALL" = true ]; then
  if ! command -v adb >/dev/null 2>&1; then
    echo "ERROR: --install requested but 'adb' not on PATH." >&2
    exit 1
  fi
  if [ -z "$(adb devices | awk 'NR>1 && $2=="device"{print $1}')" ]; then
    echo "ERROR: no connected device/emulator (check 'adb devices')." >&2
    exit 1
  fi
  echo "[aab-to-apk] installing to device ..."
  adb install -r "$UNIVERSAL_APK"
  echo "[aab-to-apk] installed."
fi
