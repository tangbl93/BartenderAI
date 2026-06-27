# Home Bartender AI — Web (前台 + 管理后台)

Vue 3 + Vite + TypeScript single-page app containing **both** the front-stage user
site (`/app/*`) and the admin console (`/admin/*`), separated by routes.

The UI runs **with no backend** by default thanks to an in-browser mock adapter,
and switches to the real backend by flipping one env var.

## Tech

- Vue 3 (`<script setup>`) + Vite + TypeScript
- Vue Router (route guards: user vs operator/admin)
- Pinia (auth / fridge / locale / onboarding stores)
- vue-i18n (5 locales: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`)
- Vitest + @vue/test-utils + jsdom
- ESLint

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
cd web
npm install
cp .env.example .env   # optional; defaults work out of the box
```

### Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000/api/v1` | Backend base URL (matches the OpenAPI server) |
| `VITE_USE_MOCK` | `true` | `true` = in-browser mock adapter (no backend needed). Set `false` to call the real backend. |
| `VITE_API_PROXY_TARGET` | `http://localhost:3000` | Dev-server proxy target for `/api` |

No secrets are stored in the web app. The image-generation API key lives only in
the backend.

## Run

```bash
npm run dev       # http://localhost:5173 (mock mode by default)
```

Demo accounts (mock mode):

- Front-stage user: `demo@bar.ai` / `password`
- Admin: `admin@bar.ai` / `admin123`
- Operator: `operator@bar.ai` / `operator123`

Front-stage entry: `/app/fridge` · Admin entry: `/admin/login`.

## Build

```bash
npm run build     # type-checks (vue-tsc) then builds to dist/
npm run preview   # serve the production build locally
```

## Test

```bash
npm run test      # vitest run (CI mode)
npm run test:watch
```

Test coverage includes:

- i18n locale **completeness** (every locale has exactly the same keys as `en`,
  no empty / `__MISSING__` values), browser-language **detection**, **fallback**
  and **persistence**, and zh-CN vs zh-TW distinctness.
- Fridge multi-select store logic (grouping, toggle, min-2 gating, pruning invalid
  selections).
- Auth store (token/role persistence, logout) and onboarding first-visit logic.
- Component render tests per major area: FridgeView, RecipeView, WallView,
  OnboardingTour, and the admin Dashboard / Ingredients / Moderation views.

## Lint

```bash
npm run lint
```

## Docker

Multi-stage build (Node build → nginx serve), with SPA fallback and an `/api`
reverse proxy to the backend.

```bash
# Build a production image talking to a real backend via /api
docker build \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  --build-arg VITE_USE_MOCK=false \
  -t home-bartender-web .

docker run -p 8080:80 home-bartender-web
# open http://localhost:8080
```

`nginx.conf` proxies `/api/` to `http://backend:3000` (the docker-compose service
name) and serves `index.html` for all other routes (SPA fallback).

## Project layout

```
src/
  api/            typed client (contract) + http impl + dev mock adapter (env toggle)
    mock/         self-contained in-memory backend + seed data
  components/     LanguageSwitcher, OnboardingTour, ExampleCard, BarChart
  i18n/           vue-i18n setup: detection / fallback / persistence
  layouts/        AppLayout (前台) + AdminLayout (后台)
  locales/        en / zh-CN / zh-TW / ja / ko JSON
  router/         routes + user/admin guards
  stores/         auth, fridge, locale, onboarding (Pinia)
  views/
    app/          fridge, recipe, poster, lab, lab-detail, wall
    admin/        dashboard, ingredients, templates, moderation
    auth/         login, register, admin-login
```
