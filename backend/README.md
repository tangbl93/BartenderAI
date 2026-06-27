# Home Bartender AI — Backend (NestJS)

REST API + AI orchestration for the居家 AI 调酒师 product. Implements the
OpenAPI contract at [`docs/api/openapi.yaml`](../docs/api/openapi.yaml) under the
global prefix `/api/v1`, with interactive Swagger docs at `/docs`.

- **Stack:** NestJS 10 + TypeORM + class-validator + Jest
- **DB:** SQLite by default (zero external services); set `DATABASE_URL=postgres://…` for Postgres
- **AI providers:** pluggable `TextProvider` / `ImageProvider`. Defaults to deterministic **stubs** when no API key is set.

## Quick start

```bash
cd backend
cp .env.example .env          # optional; sensible dev defaults are built in
npm install
npm run seed                  # creates bartender-dev.sqlite + seed data
npm run start:dev             # http://localhost:3000/api/v1  (docs at /docs)
```

## Scripts

| Command | Description |
|---|---|
| `npm run build` | Compile to `dist/` (`nest build`) |
| `npm run start` / `start:dev` / `start:prod` | Run the server |
| `npm run seed` | Idempotent seed: users, ingredients (4 categories × 5 languages), 3 default style templates, example recipes |
| `npm test` | Jest unit tests + the e2e happy-path suite |
| `npm run test:cov` | Tests with coverage |

## Seed accounts

| Role | Account | Password |
|---|---|---|
| admin | `admin@bartender.ai` | `admin12345` |
| operator | `operator@bartender.ai` | `operator12345` |
| user | `demo@bartender.ai` | `demo12345` |

## API surface (all under `/api/v1`)

- **meta:** `GET /health`, `GET /meta/locales`
- **auth:** `POST /auth/register|login|admin/login|logout`, `GET /auth/me` (JWT, bcrypt, anti-enumeration, in-memory logout blacklist)
- **ingredients:** public `GET /ingredients` (enabled, localized via `?locale`, `?category`); admin CRUD `/admin/ingredients` (category validation, soft-disable when referenced)
- **recipes:** `POST /recipes/generate` (only-selected ingredients, ≥2 else 422, precise amounts, steps, tool substitutions, alcohol range, safety notes incl. 适量饮用/未成年人禁饮, creative name + tagline, locale-driven), `GET /recipes/:id`, `GET /recipes/examples`
- **posters:** `POST /posters/jobs` (async, defaults to the 3 templates → ≥3 dimensions), `GET /posters/jobs/:id`, `POST /posters/:id/retry`. Statuses: pending/running/partial/done/failed; per-poster timeout; backend text/watermark overlay from the recipe snapshot
- **templates:** public `GET /templates`; admin CRUD `/admin/templates` + `/preview`; edits bump `version` and only affect NEW posters (templates are snapshotted into each poster at job time)
- **lab:** `/lab/entries` CRUD (author-only, 403 otherwise), `POST /lab/entries/:id/submit` → moderationStatus=pending
- **wall + moderation:** public `GET /wall` (approved only, `?sort=hot|time`); admin `GET /admin/moderation/queue`, `POST /admin/moderation/:id` (reject requires reason → 400 otherwise, writes audit `ModerationRecord`)
- **stats:** `GET /admin/stats/dashboard` (recipeCount, posterCount, submissionCount, approvalRate, topIngredients, topStyles)

## AI providers & secrets

Providers are selected by env (`TEXT_PROVIDER`, `IMAGE_PROVIDER`). The real image
provider (`gpt-image-2`) POSTs to `${IMAGE_API_BASE_URL}/images/generations` with
`Authorization: Bearer ${IMAGE_API_KEY}`. **No API key is ever hardcoded** — keys
are read from env only, and the system falls back to the deterministic stub
providers when no key is present (so dev and tests run fully offline).

## i18n

Supports `en / zh-CN / zh-TW / ja / ko`, falling back to `en`. The user `locale`
is threaded into AI orchestration so recipe steps / names / taglines / poster text
are generated in the requested language; `zh-TW` produces Traditional Chinese.

## Docker

```bash
docker build -t bartender-backend ./backend     # multi-stage node:22-alpine
docker run -p 3000:3000 --env-file backend/.env bartender-backend
```

## Testing

`npm test` runs:
- **Unit:** auth (bcrypt hashing + anti-enumeration), ingredients (category validation + soft-disable), recipes (≥2 rule + only-selected + examples + zh-TW), posters (partial success + retry), lab (ownership 403), moderation (reject-needs-reason + audit)
- **e2e (supertest):** register → login → list ingredients → generate recipe → create poster job → poll job, plus auth/RBAC negative cases. Providers are stubbed; DB is in-memory SQLite.
