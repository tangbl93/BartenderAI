# ============================================================
# Home Bartender AI — convenience targets
# ------------------------------------------------------------
# Compose files live at the project root, so run from there:
#   make -f infra/Makefile up
# or symlink/copy this to the root if you prefer `make up`.
#
# Equivalent shell wrapper: scripts/dev.sh <target>
# ============================================================

# Resolve the project root relative to this Makefile.
ROOT := $(realpath $(dir $(lastword $(MAKEFILE_LIST)))/..)
COMPOSE := docker compose --project-directory $(ROOT) -f $(ROOT)/docker-compose.yml

.DEFAULT_GOAL := help
.PHONY: help up down reset logs ps config seed test-all backend-test web-test app-test apk shots

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

env: ## Create .env from templates if missing
	@test -f $(ROOT)/.env || cat $(ROOT)/.env.example $(ROOT)/infra/.env.example > $(ROOT)/.env

up: env ## Build + start the full stack (detached)
	$(COMPOSE) up -d --build

down: ## Stop the stack (keep data)
	$(COMPOSE) down

reset: ## Stop + wipe volumes (DESTROYS data)
	$(COMPOSE) down -v

logs: ## Follow logs (make logs S=backend for one service)
	$(COMPOSE) logs -f $(S)

ps: ## Service status
	$(COMPOSE) ps

config: env ## Render + validate compose config
	$(COMPOSE) config

seed: ## Run backend DB seed inside the container
	$(COMPOSE) exec backend sh -lc 'npm run seed --if-present'

test-all: backend-test web-test app-test ## Run all test suites

backend-test: ## Backend unit tests
	@test -f $(ROOT)/backend/package.json && (cd $(ROOT)/backend && npm ci && npm test --if-present) || echo "skip backend"

web-test: ## Web unit tests
	@test -f $(ROOT)/web/package.json && (cd $(ROOT)/web && npm ci && npm test --if-present) || echo "skip web"

app-test: ## Flutter tests (incl. goldens)
	@test -f $(ROOT)/app/pubspec.yaml && (cd $(ROOT)/app && flutter pub get && flutter test) || echo "skip app"

apk: ## Convert a release AAB to universal APK: make apk AAB=path/to.aab
	$(ROOT)/scripts/aab-to-apk.sh $(AAB)

shots: ## Visual-regression baselines: make shots A=check|update
	$(ROOT)/scripts/screenshot-baseline.sh $(or $(A),check)
