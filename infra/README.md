# Infra & Run Manual — Home Bartender AI

DevOps / QA infrastructure for the full stack: local orchestration
(`docker compose`), CI, Android APK packaging, visual-regression baselines,
and the rollback strategy.

```
docker-compose.yml            ← project root: postgres + minio + backend + web (+ gateway profile)
infra/
  .env.example                compose-level variables (ports, image tag, creds) — placeholders only
  README.md                   this file
  minio/minio-init.sh         one-shot: create bucket + open public/ prefix
  nginx/gateway.conf          optional single-origin reverse proxy (profile: gateway)
.github/workflows/ci.yml      backend / web / app lanes + compose validation
scripts/
  aab-to-apk.sh               Flutter AAB -> universal APK (auto-downloads bundletool)
  screenshot-baseline.md/.sh  Playwright (web) + Flutter golden (app) visual regression
  dev.sh                      convenience wrapper (also see ../Makefile)
```

---

## 1. Run the full stack

Prereqs: Docker + Docker Compose v2.

```bash
# 1. Create your .env at the PROJECT ROOT (never commit it).
#    Merge the app-level and compose-level templates, then edit values:
cat .env.example infra/.env.example > .env
$EDITOR .env        # set POSTGRES_PASSWORD, STORAGE_SECRET_KEY, JWT_SECRET, IMAGE_API_KEY ...

# 2. Bring everything up (build images on first run).
docker compose up -d --build

# 3. Watch logs.
docker compose logs -f backend
```

The compose file injects in-network hostnames into the backend
(`postgres:5432`, `minio:9000`) so it works inside the network regardless
of the `localhost` defaults in `.env` (those are for running services
directly on the host).

### Service map

| Service       | URL (host)                          | Notes |
|---------------|-------------------------------------|-------|
| Backend API   | http://localhost:3000/api/v1        | NestJS, prefix `/api/v1` |
| **Swagger UI**| **http://localhost:3000/docs**      | OpenAPI docs served by backend |
| Web (nginx)   | http://localhost:8080               | Vue SPA |
| Postgres      | localhost:5432                      | user/db `bartender` (see `.env`) |
| MinIO S3 API  | http://localhost:9000               | bucket `bartender` |
| MinIO console | http://localhost:9001               | login = `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` |

### Optional single-origin gateway

Route web + API through one port (avoids browser CORS); build web with
`VITE_API_BASE_URL=/api/v1` first:

```bash
docker compose --profile gateway up -d
# -> http://localhost (/, /api/v1, /docs, /minio/)
```

### Common operations

```bash
docker compose ps                     # status
docker compose logs -f                # all logs
docker compose down                   # stop (keeps volumes/data)
docker compose down -v                # stop + wipe pgdata/miniodata
docker compose config                 # render + validate effective config
```

Or via the Makefile / `scripts/dev.sh` (`up`, `down`, `logs`, `seed`,
`test-all`, …) — see the project root.

---

## 2. Swagger / API docs

Backend exposes OpenAPI/Swagger at **http://localhost:3000/api/v1** for the
API and **http://localhost:3000/docs** for the interactive UI. The single
source of truth contract is `docs/api/openapi.yaml`.

---

## 3. Build the Android APK

The App team ships Android via AAB → universal APK (bundletool).

```bash
# 1. Build the release bundle (in app/).
cd app && flutter build appbundle --release
#    -> app/build/app/outputs/bundle/release/app-release.aab

# 2. Convert to an installable universal APK (bundletool auto-downloaded).
cd ..
scripts/aab-to-apk.sh app/build/app/outputs/bundle/release/app-release.aab

# Release-signed + install to a connected device:
export AAB_STORE_PASSWORD=... AAB_KEY_PASSWORD=...
scripts/aab-to-apk.sh app/build/app/outputs/bundle/release/app-release.aab \
    -k ~/keys/bartender.jks -a bartender --install
```

Signing secrets are passed via env vars / flags only — never committed.
Without a keystore the script emits a debug-signed APK for internal testing.

---

## 4. Testing & visual regression

- Unit/system tests run per-lane in CI (`.github/workflows/ci.yml`):
  backend (Jest), web (Vitest + Playwright), app (Flutter golden).
- Visual baselines + flow: `scripts/screenshot-baseline.md`
  (helper: `scripts/screenshot-baseline.sh check|update`).

---

## 5. Rollback strategy (image tags)

Releases are immutable, tagged container images. Rollback = redeploy the
previous tag (no rebuild).

1. **Tag on release.** Build/publish backend + web with a version or git
   SHA, not `latest`:
   ```bash
   IMAGE_TAG=v1.4.0 docker compose build
   # docker tag / push bartender-backend:v1.4.0, bartender-web:v1.4.0 to your registry
   ```
   The compose file already parameterizes images as
   `bartender-backend:${IMAGE_TAG}` / `bartender-web:${IMAGE_TAG}`.

2. **Deploy** by setting `IMAGE_TAG` in the environment and
   `docker compose up -d`.

3. **Roll back** by pointing `IMAGE_TAG` at the last known-good tag and
   re-running `docker compose up -d` — only the app containers cycle;
   `pgdata` / `miniodata` named volumes persist, so data survives.
   - DB schema: pair each image tag with its migration; roll back only to a
     tag whose migrations are compatible with the current schema (prefer
     expand/contract migrations so the previous image still runs).

4. **App (APK):** keep historical signed APKs/AABs per version; roll back by
   redistributing the previous APK (see design.md Migration Plan §5).

No secrets live in images or compose — all injected at runtime via `.env`.
