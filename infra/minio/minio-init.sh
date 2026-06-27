#!/bin/sh
# ============================================================
# MinIO bucket bootstrap (run as the `minio-init` one-shot service)
# ------------------------------------------------------------
# Waits for the MinIO server, then:
#   1. registers an mc alias
#   2. creates the storage bucket if missing (idempotent)
#   3. opens public read on the `public/` prefix so shareable posters
#      resolve via STORAGE_PUBLIC_BASE_URL while everything else stays
#      private (backend issues presigned URLs for private media).
#
# Env (injected by docker-compose):
#   MINIO_ENDPOINT       e.g. http://minio:9000
#   STORAGE_ACCESS_KEY   MinIO root user
#   STORAGE_SECRET_KEY   MinIO root password
#   STORAGE_BUCKET       bucket name
# ============================================================
set -eu

ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
ACCESS_KEY="${STORAGE_ACCESS_KEY:-minioadmin}"
SECRET_KEY="${STORAGE_SECRET_KEY:-minioadmin}"
BUCKET="${STORAGE_BUCKET:-bartender}"

echo "[minio-init] waiting for MinIO at ${ENDPOINT} ..."
# mc alias set retries internally; loop until the server answers.
until mc alias set local "${ENDPOINT}" "${ACCESS_KEY}" "${SECRET_KEY}" >/dev/null 2>&1; do
  echo "[minio-init] MinIO not ready yet, retrying in 2s ..."
  sleep 2
done

echo "[minio-init] ensuring bucket '${BUCKET}' exists ..."
mc mb --ignore-existing "local/${BUCKET}"

echo "[minio-init] opening public read on 'local/${BUCKET}/public/*' ..."
# Anonymous download only on the public/ prefix; the rest stays private.
mc anonymous set download "local/${BUCKET}/public" || \
  echo "[minio-init] note: could not set prefix policy (older mc?); continuing"

echo "[minio-init] done."
