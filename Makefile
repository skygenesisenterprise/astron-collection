# Astron Collection — developer & operator interface.
#
# A thin layer over the tools that already exist in the repository (pnpm,
# docker, docker compose). No build or deployment logic is duplicated here:
# every target just calls the corresponding tool or package script.
#
# The Compose stack has four service groups (postgres, redis, client, api) and two
# profiles: `prod` (default) and `dev`. The environment -- `self` (self-hosted) or
# `cloud` (Astron Collection Cloud) -- is selected per invocation and only changes
# runtime behaviour, never the container topology.
#
#   make help

SHELL := /bin/bash
.DEFAULT_GOAL := help

# --- Selectable configuration ---------------------------------------------
# ASTRON_COLLECTION_VERSION overrides the image tag, ASTRON_COLLECTION_REGISTRY the registry.
# ASTRON_COLLECTION_PORT and ASTRON_COLLECTION_API_PORT are left unset on purpose so
# docker-compose.yml keeps resolving them from .env (or from their defaults); pass
# ASTRON_COLLECTION_PORT=8080 to override.
#
# The environment (self | cloud) is deliberately NOT one of them: it can only be
# chosen with a make goal, never by editing this file or .env — see "Inline
# environment flag" below. ASTRON_COLLECTION_FLAVOR, ASTRON_COLLECTION_PRODUCT and
# IS_CLOUD are derived from it and must not be set by hand.
ASTRON_COLLECTION_VERSION ?= latest
ASTRON_COLLECTION_REGISTRY ?= ghcr.io/skygenesisenterprise
# Image of the standalone status page (separate product, not part of the stack).
STATUS_IMAGE ?= $(ASTRON_COLLECTION_REGISTRY)/astron-collection-status

PNPM ?= pnpm
COMPOSE ?= docker compose

# --- Inline environment flag -----------------------------------------------
# Select the environment for one invocation, without editing .env or exporting
# anything. Works with docker-build, docker-up and docker-dev:
#
#   make docker-up self      # self-hosted (default)
#   make docker-up cloud     # Astron Collection Cloud
#   make docker-dev self     # self-hosted with hot reload
#
# GNU make itself rejects `make docker-dev --self` (`--self` is parsed as an
# unknown make option before any recipe runs), hence the `--` separator or the
# bare word. Both environments build the same Dockerfile targets; only the image
# tags and the runtime variables differ.
#
# --- Remembered environment ------------------------------------------------
# Each build records the environment in PRODUCT_STATE, so a later command reuses
# the environment that was built last:
#
#   make docker-up self   # build a fresh image + start self-hosted
#   make docker-up        # start the environment built last, without rebuilding
#   make docker-down      # stop the stack — the images are kept for the next start
#
# Precedence: inline environment flag > the environment recorded by the last build
# > self. ASTRON_COLLECTION_FLAVOR= / IS_CLOUD= passed by hand are rejected (see the
# warnings below): the flavor only follows the selected environment.
PRODUCT_STATE := .make-product

GOAL_PRODUCT := $(firstword $(filter self cloud,$(patsubst --%,%,$(MAKECMDGOALS))))

ifneq ($(GOAL_PRODUCT),)
SELECTED_PRODUCT := $(GOAL_PRODUCT)
else ifneq ($(wildcard $(PRODUCT_STATE)),)
SELECTED_PRODUCT := $(shell cat $(PRODUCT_STATE))
else
SELECTED_PRODUCT := self
endif

# ASTRON_COLLECTION_FLAVOR / IS_CLOUD are derived below: refuse a direct assignment
# instead of silently running an environment that was not selected.
ifneq ($(filter $(origin ASTRON_COLLECTION_FLAVOR),command line environment),)
$(warning ASTRON_COLLECTION_FLAVOR is derived from the environment — use 'make <goal> self|cloud' instead; ignoring 'ASTRON_COLLECTION_FLAVOR=$(ASTRON_COLLECTION_FLAVOR)')
endif
ifneq ($(filter $(origin IS_CLOUD),command line environment),)
$(warning IS_CLOUD is derived from the environment — use 'make <goal> self|cloud' instead; ignoring 'IS_CLOUD=$(IS_CLOUD)')
endif

# `override` so the selection cannot be bypassed by a command-line assignment.
ifeq ($(SELECTED_PRODUCT),cloud)
override ASTRON_COLLECTION_FLAVOR := cloud
override ASTRON_COLLECTION_PRODUCT := cloud
override IS_CLOUD := true
override ASTRON_COLLECTION_CLIENT_IMAGE := $(ASTRON_COLLECTION_REGISTRY)/astron-collection-client-cloud
override ASTRON_COLLECTION_API_IMAGE := $(ASTRON_COLLECTION_REGISTRY)/astron-collection-api-cloud
else
override ASTRON_COLLECTION_FLAVOR := selfhosted
override ASTRON_COLLECTION_PRODUCT := self
override IS_CLOUD := false
override ASTRON_COLLECTION_CLIENT_IMAGE := $(ASTRON_COLLECTION_REGISTRY)/astron-collection-client
override ASTRON_COLLECTION_API_IMAGE := $(ASTRON_COLLECTION_REGISTRY)/astron-collection-api
endif

PRODUCT_WORD := $(SELECTED_PRODUCT)

# Exported to every compose invocation so image tags and runtime variables stay in
# sync with the selected environment.
COMPOSE_ENV = ASTRON_COLLECTION_FLAVOR=$(ASTRON_COLLECTION_FLAVOR) ASTRON_COLLECTION_PRODUCT=$(ASTRON_COLLECTION_PRODUCT) IS_CLOUD=$(IS_CLOUD) ASTRON_COLLECTION_CLIENT_IMAGE=$(ASTRON_COLLECTION_CLIENT_IMAGE) ASTRON_COLLECTION_API_IMAGE=$(ASTRON_COLLECTION_API_IMAGE) ASTRON_COLLECTION_VERSION=$(ASTRON_COLLECTION_VERSION) STATUS_IMAGE=$(STATUS_IMAGE) ASTRON_COLLECTION_MODE=production NODE_ENV=production

# Development environment: same four services, `dev` build target (sources +
# dependencies), in-container dev servers, distinct image tags so a dev build never
# overwrites the production image. A Compose file cannot switch a service's build
# target from a profile, so the mode is passed here rather than duplicated as
# `api-dev` / `client-dev` services.
COMPOSE_ENV_DEV = ASTRON_COLLECTION_FLAVOR=$(ASTRON_COLLECTION_FLAVOR) ASTRON_COLLECTION_PRODUCT=$(ASTRON_COLLECTION_PRODUCT) IS_CLOUD=$(IS_CLOUD) ASTRON_COLLECTION_CLIENT_IMAGE=astron-collection-dev-client ASTRON_COLLECTION_API_IMAGE=astron-collection-dev-api ASTRON_COLLECTION_VERSION=$(ASTRON_COLLECTION_VERSION) STATUS_IMAGE=$(STATUS_IMAGE) ASTRON_COLLECTION_BUILD_TARGET=dev ASTRON_COLLECTION_MODE=development ASTRON_COLLECTION_RUN_MIGRATIONS=1 NODE_ENV=development

# Both profiles are named on `down`/`ps`/`logs` so the mode that is not active is
# still inspected and never left behind.
COMPOSE_ALL_PROFILES = --profile prod --profile dev

.PHONY: help install deps dev build test typecheck lint \
        docker-build docker-up docker-down docker-restart docker-logs docker-ps docker-config docker-dev \
        migrate backup restore doctor update clean \
        self cloud --self --cloud

# No-op goals that only carry the environment flag (see GOAL_PRODUCT above). They
# exist so `make docker-build cloud` / `make docker-dev -- --self` have a rule to
# satisfy while the real target reads the environment from MAKECMDGOALS.
self cloud --self --cloud:
	@:

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
help: ## Show this help
	@echo "Astron Collection — available commands:"
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Stack:     4 groups — postgres, redis, client, api (profiles: prod | dev)"
	@echo "Variables: ASTRON_COLLECTION_VERSION=$(ASTRON_COLLECTION_VERSION)"
	@echo "           ASTRON_COLLECTION_CLIENT_IMAGE=$(ASTRON_COLLECTION_CLIENT_IMAGE)"
	@echo "           ASTRON_COLLECTION_API_IMAGE=$(ASTRON_COLLECTION_API_IMAGE)"
	@echo "           ASTRON_COLLECTION_PORT=$${ASTRON_COLLECTION_PORT:-3000} ASTRON_COLLECTION_API_PORT=$${ASTRON_COLLECTION_API_PORT:-4000}"
	@echo "Environment: $(PRODUCT_WORD)$$(test -f $(PRODUCT_STATE) && echo ' (saved by the last build)')"
	@echo "Examples:  make docker-up self              # build + start self-hosted (prod profile)"
	@echo "           make docker-up cloud             # build + start Astron Collection Cloud"
	@echo "           make docker-up                   # restart what was built last, no rebuild"
	@echo "           make docker-dev                  # hot-reloading stack (dev profile)"
	@echo "           make docker-dev self             # hot-reloading stack, self-hosted"
	@echo "           make docker-dev cloud            # hot-reloading stack, Astron Collection Cloud"
	@echo "           make migrate                     # apply the migrations once"

# ---------------------------------------------------------------------------
# Local development (host toolchain)
# ---------------------------------------------------------------------------
deps: ## Install workspace dependencies (pnpm install --frozen-lockfile)
	$(PNPM) install --frozen-lockfile

dev: ## Run the app in development mode on the host (pnpm dev)
	$(PNPM) dev

build: ## Build the workspace (pnpm build)
	$(PNPM) build

test: ## Run the test suites (pnpm test)
	$(PNPM) test

typecheck: ## Type-check the workspace (pnpm typecheck)
	$(PNPM) typecheck

lint: ## Lint/format check (pnpm lint)
	$(PNPM) lint

# ---------------------------------------------------------------------------
# Docker — four services, two profiles
#
#   prod profile: postgres, redis, api (node dist/server.mjs), client (next start)
#   dev profile:  the same four services, built from the `dev` target: api runs
#                 `tsx server/server.ts`, client runs `next dev`, both with watch.
#
# `client` and `api` publish ASTRON_COLLECTION_PORT (3000) and
# ASTRON_COLLECTION_API_PORT (4000) in both profiles, so the two modes are mutually
# exclusive — `make docker-down` stops either. PostgreSQL and Redis are never
# published.
# ---------------------------------------------------------------------------
install: ## Create .env from the template (if missing) and start the stack
	@test -f .env || { cp .env.example .env; echo "==> .env created from .env.example — set POSTGRES_PASSWORD, REDIS_PASSWORD and BETTER_AUTH_SECRET, then re-run"; exit 1; }
	@$(MAKE) docker-up

docker-build: ## Build the images for the selected environment (add: self | cloud)
	@echo "==> building environment=$(PRODUCT_WORD) flavor=$(ASTRON_COLLECTION_FLAVOR) is_cloud=$(IS_CLOUD)"
	$(COMPOSE_ENV) $(COMPOSE) --profile prod build client api
	@printf '%s\n' '$(PRODUCT_WORD)' > $(PRODUCT_STATE)

docker-up: ## Start the stack in the prod profile (add: self | cloud to rebuild first)
	@echo "==> starting environment=$(PRODUCT_WORD) flavor=$(ASTRON_COLLECTION_FLAVOR) is_cloud=$(IS_CLOUD)"
	$(COMPOSE_ENV) $(COMPOSE) --profile prod up -d --build

ifneq ($(GOAL_PRODUCT),)
docker-up: docker-build
endif

docker-down: ## Stop the stack, dev containers included (volumes are preserved)
	@echo "==> stopping the stack (data volumes preserved)"
	$(COMPOSE) $(COMPOSE_ALL_PROFILES) down --remove-orphans --timeout 15

docker-restart: ## Restart the stack without rebuilding
	$(COMPOSE_ENV) $(COMPOSE) --profile prod restart

docker-logs: ## Follow the stack logs (optionally: make docker-logs SERVICE=api)
	@if [ -n "$(SERVICE)" ]; then \
		$(COMPOSE) $(COMPOSE_ALL_PROFILES) logs -f $(SERVICE); \
	else \
		$(COMPOSE) $(COMPOSE_ALL_PROFILES) logs -f; \
	fi

docker-ps: ## Show stack status
	$(COMPOSE) $(COMPOSE_ALL_PROFILES) ps -a

docker-config: ## Validate and print the resolved Compose configuration
	$(COMPOSE_ENV) $(COMPOSE) $(COMPOSE_ALL_PROFILES) config

docker-dev: ## Run the hot-reloading stack (add: self | cloud; dev profile on the same four services)
	@echo "==> starting environment=$(PRODUCT_WORD) flavor=$(ASTRON_COLLECTION_FLAVOR) is_cloud=$(IS_CLOUD) (dev profile, build target dev)"
	$(COMPOSE_ENV_DEV) $(COMPOSE) --profile dev up --build --watch
	@printf '%s\n' '$(PRODUCT_WORD)' > $(PRODUCT_STATE)

migrate: ## Apply the database migrations once (one-off run of the `api` service)
	$(COMPOSE_ENV) $(COMPOSE) --profile prod run --rm api migrate

# ---------------------------------------------------------------------------
# Operations
# ---------------------------------------------------------------------------
backup: ## Dump the database into ./backups (SQL file, timestamped)
	@mkdir -p backups
	@$(COMPOSE) --profile prod exec -T postgres sh -c 'pg_dump -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' \
		> backups/astron-$(shell date +%Y%m%d_%H%M%S).sql
	@echo "==> backup written to backups/"

restore: ## Restore a dump: make restore FILE=backups/astron-<date>.sql
	@test -n "$(FILE)" || { echo "usage: make restore FILE=backups/astron-<date>.sql"; exit 1; }
	@test -f "$(FILE)" || { echo "==> $(FILE) not found"; exit 1; }
	@$(COMPOSE) --profile prod exec -T postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' < $(FILE)
	@echo "==> restored $(FILE)"

doctor: ## Check installation health
	@echo "Astron Collection Doctor"
	@echo "==============="
	@echo ""
	@echo "System:"
	@command -v docker >/dev/null 2>&1 && echo "✓ Docker" || echo "✗ Docker missing"
	@docker compose version >/dev/null 2>&1 && echo "✓ Docker Compose" || echo "✗ Docker Compose missing"
	@echo ""
	@echo "Configuration:"
	@test -f .env && echo "✓ .env exists" || echo "✗ .env missing"
	@grep -qE '^BETTER_AUTH_SECRET=.{32,}' .env 2>/dev/null && echo "✓ BETTER_AUTH_SECRET looks strong" || echo "✗ BETTER_AUTH_SECRET missing or too short"
	@echo ""
	@echo "Runtime:"
	@$(COMPOSE) $(COMPOSE_ALL_PROFILES) ps 2>&1 | tail -5
	@echo ""
	@echo "Storage:"
	@docker volume ls | grep astron-collection && echo "✓ Astron Collection volumes present" || echo "✗ No volumes found"

update: ## Pull the latest revision and rebuild the stack
	@git pull
	@$(MAKE) docker-up

clean: ## Remove local build artifacts (.next, dist, tsbuildinfo, saved environment)
	rm -rf apps/*/.next apps/*/dist packages/*/dist web/*/.next web/*/dist
	find . -name '*.tsbuildinfo' -not -path './node_modules/*' -delete
	rm -f $(PRODUCT_STATE)
