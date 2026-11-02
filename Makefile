# Astron Collection — developer & operator interface.
#
# A thin layer over the tools that already exist in the repository (pnpm,
# docker, docker compose). No build or deployment logic is duplicated here:
# every target just calls the corresponding tool or package script.
#
# Two families of products, addressed the same way — by name, on the command line:
#
#   editions  self | cloud | console   the platform stack (postgres, redis, client, api)
#   bots      main | protect | logger | automation | player | guild-center
#
# So `make docker-up self` starts the self-hosted platform, `make docker-up main`
# starts the Discord bot, and `make docker-dev player` runs the same product with
# its development mode. The selected product is remembered in `.make-product`, so
# `make docker-down` stops exactly what was started last.
#
#   make help

SHELL := /bin/bash
.DEFAULT_GOAL := help

# --- Selectable configuration ---------------------------------------------
# ASTRON_COLLECTION_VERSION is the image tag that is *consumed* (what Compose runs):
# `latest` by default, `v1.3.0` to pin a published release.
# ASTRON_COLLECTION_REGISTRY is the registry images are pulled from/pushed to.
# ASTRON_COLLECTION_PORT and ASTRON_COLLECTION_API_PORT are left unset on purpose so
# docker-compose.yml keeps resolving them from .env (or from their defaults); pass
# ASTRON_COLLECTION_PORT=8080 to override.
#
# The product (self | cloud | console | a bot) is deliberately NOT one of them: it
# can only be chosen with a make goal, never by editing this file or .env — see
# "Inline product flag" below. The flavor variables it implies are derived below
# and must not be set by hand.
ASTRON_COLLECTION_VERSION ?= latest
ASTRON_COLLECTION_REGISTRY ?= ghcr.io/skygenesisenterprise
# Image of the standalone status page (separate product, not part of the stack).
STATUS_IMAGE ?= $(ASTRON_COLLECTION_REGISTRY)/astron-collection-status

PNPM ?= pnpm
COMPOSE ?= docker compose
DOCKER ?= docker

# Version the *local* build is tagged with: `v<major>.<minor>.<patch>`, the same
# shape docker-publish.yml publishes. Override to reproduce a specific release.
APP_VERSION := $(shell node -p "require('./apps/astron/package.json').version" 2>/dev/null || echo 0.0.0)
IMAGE_VERSION ?= v$(APP_VERSION)
GIT_SHA := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)

# --- Products ---------------------------------------------------------------
PLATFORM_EDITIONS := self cloud console
BOTS := main protect logger automation player guild-center
PRODUCTS := $(PLATFORM_EDITIONS) $(BOTS)

# Bot directory and GHCR image, exactly as docker-publish.yml publishes them.
# `guild-center` lives in bot/guild today (the workflow resolves the same fallback).
BOT_DIR_main := bot/main
BOT_DIR_protect := bot/protect
BOT_DIR_logger := bot/logger
BOT_DIR_automation := bot/automation
BOT_DIR_player := bot/player
BOT_DIR_guild-center := bot/guild

BOT_IMAGE_main := astron
BOT_IMAGE_protect := astron-protect
BOT_IMAGE_logger := astron-logger
BOT_IMAGE_automation := astron-automation
BOT_IMAGE_player := astron-player
BOT_IMAGE_guild-center := guild-center

# --- Inline product flag ----------------------------------------------------
# Select the product for one invocation, without editing .env or exporting
# anything. Works with docker-build, docker-up, docker-dev and the image targets:
#
#   make docker-up self        # self-hosted platform (default)
#   make docker-up cloud       # Astron Collection Cloud
#   make docker-up console     # Astron Collection Console
#   make docker-up main        # the main Discord bot
#   make docker-dev player     # the player bot, in development mode
#
# GNU make itself rejects `make docker-dev --self` (`--self` is parsed as an
# unknown make option before any recipe runs), hence the `--` separator or the
# bare word. Editions build the root Dockerfile; bots build their own context.
#
# --- Remembered product -----------------------------------------------------
# Each build records the product in PRODUCT_STATE, so a later command reuses the
# product that was built last:
#
#   make docker-up self   # build a fresh image + start the platform
#   make docker-up main   # build a fresh image + start the main bot
#   make docker-down      # stop the product started last (volumes are kept)
#
# Precedence: inline product flag > the product recorded by the last build > self.
PRODUCT_STATE := .make-product

GOAL_PRODUCT := $(firstword $(filter $(PRODUCTS),$(patsubst --%,%,$(MAKECMDGOALS))))

ifneq ($(GOAL_PRODUCT),)
SELECTED_PRODUCT := $(GOAL_PRODUCT)
else ifneq ($(wildcard $(PRODUCT_STATE)),)
SELECTED_PRODUCT := $(shell cat $(PRODUCT_STATE))
else
SELECTED_PRODUCT := self
endif

# Empty for an edition, `bot/<dir>` for a bot: this single variable routes every
# compose/docker command below.
BOT_DIR := $(BOT_DIR_$(SELECTED_PRODUCT))

# ASTRON_COLLECTION_FLAVOR / IS_CLOUD are derived: refuse a direct assignment
# instead of silently running an environment that was not selected.
ifneq ($(filter $(origin ASTRON_COLLECTION_FLAVOR),command line environment),)
$(warning ASTRON_COLLECTION_FLAVOR is derived from the product — use 'make <goal> <product>' instead; ignoring 'ASTRON_COLLECTION_FLAVOR=$(ASTRON_COLLECTION_FLAVOR)')
endif
ifneq ($(filter $(origin IS_CLOUD),command line environment),)
$(warning IS_CLOUD is derived from the product — use 'make <goal> <product>' instead; ignoring 'IS_CLOUD=$(IS_CLOUD)')
endif

# `override` so the selection cannot be bypassed by a command-line assignment.
#
# Console is the cloud-side fleet manager: a hosted deployment (IS_CLOUD) whose
# product is stated explicitly, which is exactly what the entitlements resolver in
# packages/server expects (`ASTRON_COLLECTION_PRODUCT` wins over every hint).
ifeq ($(SELECTED_PRODUCT),console)
override ASTRON_COLLECTION_FLAVOR := console
override ASTRON_COLLECTION_PRODUCT := console
override IS_CLOUD := true
override ASTRON_COLLECTION_IMAGE := $(ASTRON_COLLECTION_REGISTRY)/astron-collection-console
else ifeq ($(SELECTED_PRODUCT),cloud)
override ASTRON_COLLECTION_FLAVOR := cloud
override ASTRON_COLLECTION_PRODUCT := cloud
override IS_CLOUD := true
override ASTRON_COLLECTION_IMAGE := $(ASTRON_COLLECTION_REGISTRY)/astron-collection-cloud
else ifeq ($(SELECTED_PRODUCT),self)
override ASTRON_COLLECTION_FLAVOR := selfhosted
override ASTRON_COLLECTION_PRODUCT := self
override IS_CLOUD := false
override ASTRON_COLLECTION_IMAGE := $(ASTRON_COLLECTION_REGISTRY)/astron-collection
else
# A bot carries no platform flavor; these stay at their self-hosted defaults so
# the exported environment is always complete.
override ASTRON_COLLECTION_FLAVOR := selfhosted
override ASTRON_COLLECTION_PRODUCT := self
override IS_CLOUD := false
endif

# The single image of the selected product — one per edition, one per bot, never
# one per service.
ifneq ($(BOT_DIR),)
IMAGE_NAME := $(ASTRON_COLLECTION_REGISTRY)/$(BOT_IMAGE_$(SELECTED_PRODUCT))
else
IMAGE_NAME := $(ASTRON_COLLECTION_IMAGE)
endif

PRODUCT_WORD := $(SELECTED_PRODUCT)

# Exported to every compose invocation so image tags and runtime variables stay in
# sync with the selected product.
COMPOSE_ENV = ASTRON_COLLECTION_FLAVOR=$(ASTRON_COLLECTION_FLAVOR) ASTRON_COLLECTION_PRODUCT=$(ASTRON_COLLECTION_PRODUCT) IS_CLOUD=$(IS_CLOUD) ASTRON_COLLECTION_IMAGE=$(ASTRON_COLLECTION_IMAGE) ASTRON_COLLECTION_VERSION=$(ASTRON_COLLECTION_VERSION) STATUS_IMAGE=$(STATUS_IMAGE) ASTRON_COLLECTION_MODE=production NODE_ENV=production

# Development environment: same four services and the same single image, built
# from the `dev` target (sources + dependencies), with in-container dev servers.
# A Compose file cannot switch a service's build target from a profile, so the
# target is passed here rather than duplicated as `api-dev` / `client-dev`
# services. The dev image gets its own tag so it never overwrites a production one.
COMPOSE_ENV_DEV = ASTRON_COLLECTION_FLAVOR=$(ASTRON_COLLECTION_FLAVOR) ASTRON_COLLECTION_PRODUCT=$(ASTRON_COLLECTION_PRODUCT) IS_CLOUD=$(IS_CLOUD) ASTRON_COLLECTION_IMAGE=$(ASTRON_COLLECTION_IMAGE)-dev ASTRON_COLLECTION_VERSION=$(ASTRON_COLLECTION_VERSION) STATUS_IMAGE=$(STATUS_IMAGE) ASTRON_COLLECTION_BUILD_TARGET=dev ASTRON_COLLECTION_MODE=development ASTRON_COLLECTION_RUN_MIGRATIONS=1 NODE_ENV=development

# Bots keep their own Compose file, their own Redis and their own volumes. The
# image reference is the published GHCR one; `build:` in those files still works
# for a local build (`make docker-dev main`).
COMPOSE_ENV_BOT = ASTRON_BOT_IMAGE=$(IMAGE_NAME) ASTRON_BOT_VERSION=$(IMAGE_VERSION) ASTRON_COLLECTION_VERSION=$(ASTRON_COLLECTION_VERSION) NODE_ENV=production
COMPOSE_ENV_BOT_DEV = ASTRON_BOT_IMAGE=$(IMAGE_NAME)-dev ASTRON_BOT_VERSION=$(IMAGE_VERSION) ASTRON_COLLECTION_VERSION=$(ASTRON_COLLECTION_VERSION) NODE_ENV=development

# Both profiles are named on `down`/`ps`/`logs` so the mode that is not active is
# still inspected and never left behind.
COMPOSE_ALL_PROFILES = --profile prod --profile dev

# --- Command routing --------------------------------------------------------
# An edition drives the root Compose stack; a bot drives its own Compose file.
ifeq ($(BOT_DIR),)
COMPOSE_UP = $(COMPOSE_ENV) $(COMPOSE) --profile prod up -d --build
COMPOSE_DEV = $(COMPOSE_ENV_DEV) $(COMPOSE) --profile dev up --build --watch
COMPOSE_BUILD = $(COMPOSE_ENV) $(COMPOSE) --profile prod build client api
COMPOSE_DOWN = $(COMPOSE) $(COMPOSE_ALL_PROFILES) down --remove-orphans --timeout 15
COMPOSE_PS = $(COMPOSE) $(COMPOSE_ALL_PROFILES) ps -a
COMPOSE_LOGS = $(COMPOSE) $(COMPOSE_ALL_PROFILES) logs -f
COMPOSE_RESTART = $(COMPOSE_ENV) $(COMPOSE) --profile prod restart
COMPOSE_CONFIG = $(COMPOSE_ENV) $(COMPOSE) $(COMPOSE_ALL_PROFILES) config
else
COMPOSE_UP = $(COMPOSE_ENV_BOT) $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml up -d --build
COMPOSE_DEV = $(COMPOSE_ENV_BOT_DEV) $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml up --build
COMPOSE_BUILD = $(COMPOSE_ENV_BOT) $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml build
COMPOSE_DOWN = $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml down --remove-orphans --timeout 15
COMPOSE_PS = $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml ps -a
COMPOSE_LOGS = $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml logs -f
COMPOSE_RESTART = $(COMPOSE_ENV_BOT) $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml restart
COMPOSE_CONFIG = $(COMPOSE_ENV_BOT) $(COMPOSE) -f $(BOT_DIR)/docker-compose.yml config
endif

# Local image tags: the same three docker-publish.yml produces (version, latest,
# sha-<commit>), so `make image-build self` then `make image-push self` reproduces
# a release. The version tag is immutable when published, which is why `latest`
# and the sha tag exist next to it.
IMAGE_TAGS = -t $(IMAGE_NAME):$(IMAGE_VERSION) -t $(IMAGE_NAME):latest -t $(IMAGE_NAME):sha-$(GIT_SHA)
IMAGE_PLATFORM_FLAG = $(if $(ASTRON_COLLECTION_PLATFORMS),--platform $(ASTRON_COLLECTION_PLATFORMS),)

.PHONY: help install deps dev build test test-bots check-bots typecheck lint \
        docker-build docker-up docker-down docker-restart docker-logs docker-ps docker-config docker-dev \
        image-build image-pull image-push image-inspect image-tags \
        migrate backup restore doctor update clean \
        $(PRODUCTS) $(addprefix --,$(PRODUCTS))

# No-op goals that only carry the product flag (see GOAL_PRODUCT above). They
# exist so `make docker-build cloud` / `make docker-up main` / `make docker-dev --
# --self` have a rule to satisfy while the real target reads the product from
# MAKECMDGOALS.
$(PRODUCTS) $(addprefix --,$(PRODUCTS)):
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
	@echo "Products:  editions: $(PLATFORM_EDITIONS)"
	@echo "           bots:     $(BOTS)"
	@echo "Selected:  $(PRODUCT_WORD)$$(test -f $(PRODUCT_STATE) && echo ' (saved by the last build)')"
	@echo "Image:     $(IMAGE_NAME):$(IMAGE_VERSION) (also :latest, :sha-$(GIT_SHA))"
	@echo "Consumed:  $(IMAGE_NAME):$(ASTRON_COLLECTION_VERSION)"
	@echo ""
	@echo "Examples:  make docker-up self              # build + start the self-hosted platform"
	@echo "           make docker-up cloud             # Astron Collection Cloud"
	@echo "           make docker-up console           # Astron Collection Console"
	@echo "           make docker-up main              # the main Discord bot"
	@echo "           make docker-dev player           # the player bot, hot-reloading sources"
	@echo "           make docker-up                   # restart what was built last, no rebuild"
	@echo "           make image-build console         # tag the local edition image v<version>/latest/sha"
	@echo "           make image-pull self             # pull the published edition image"

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

test-bots: ## Run the Discord framework test suite
	node --test packages/discord-framework/test/*.test.js

check-bots: ## Check that each bot owns its catalogue and uses the framework
	node scripts/check-bots.mjs

typecheck: ## Type-check the workspace (pnpm typecheck)
	$(PNPM) typecheck

lint: ## Lint/format check (pnpm lint)
	$(PNPM) lint

# ---------------------------------------------------------------------------
# Docker — editions (postgres, redis, client, api) and bots (bot, redis)
#
#   prod profile: postgres, redis, api (node dist/server.mjs), client (next start)
#   dev profile:  the same four services, built from the `dev` target: api runs
#                 `tsx server/server.ts`, client runs `next dev`, both with watch.
#
# `client` and `api` share one image and differ only by ASTRON_COLLECTION_ROLE.
# They publish ASTRON_COLLECTION_PORT (3000) and ASTRON_COLLECTION_API_PORT (4000)
# in both profiles, so the two modes are mutually exclusive — `make docker-down`
# stops either. PostgreSQL and Redis are never published.
#
# A bot runs from bot/<dir>/docker-compose.yml with its own Redis, volumes and
# network: bots are independent products, exactly as they are published.
# ---------------------------------------------------------------------------
install: ## Create .env from the template (if missing) and start the selected product
	@test -f .env || { cp .env.example .env; echo "==> .env created from .env.example — set POSTGRES_PASSWORD, REDIS_PASSWORD and BETTER_AUTH_SECRET, then re-run"; exit 1; }
	@$(MAKE) docker-up

docker-build: ## Build the image of the selected product (add: self | cloud | console | a bot)
	@echo "==> building product=$(PRODUCT_WORD) image=$(IMAGE_NAME)"
	$(COMPOSE_BUILD)
	@printf '%s\n' '$(PRODUCT_WORD)' > $(PRODUCT_STATE)

docker-up: ## Start the selected product in the prod profile (add: self | cloud | console | a bot)
	@echo "==> starting product=$(PRODUCT_WORD) image=$(IMAGE_NAME):$(ASTRON_COLLECTION_VERSION)"
	$(COMPOSE_UP)

ifneq ($(GOAL_PRODUCT),)
docker-up: docker-build
endif

docker-down: ## Stop the selected product (volumes are preserved)
	@echo "==> stopping $(PRODUCT_WORD) (data volumes preserved)"
	$(COMPOSE_DOWN)

docker-restart: ## Restart the selected product without rebuilding
	$(COMPOSE_RESTART)

docker-logs: ## Follow the logs (optionally: make docker-logs SERVICE=api)
	@if [ -n "$(SERVICE)" ]; then \
		$(COMPOSE_LOGS) $(SERVICE); \
	else \
		$(COMPOSE_LOGS); \
	fi

docker-ps: ## Show the status of the selected product
	$(COMPOSE_PS)

docker-config: ## Validate and print the resolved Compose configuration
	$(COMPOSE_CONFIG)

docker-dev: ## Run the selected product with hot reload (add: self | cloud | console | a bot)
	@echo "==> starting product=$(PRODUCT_WORD) image=$(IMAGE_NAME) (development mode)"
	$(COMPOSE_DEV)
	@printf '%s\n' '$(PRODUCT_WORD)' > $(PRODUCT_STATE)

migrate: ## Apply the database migrations once (one-off run of the `api` service)
	$(COMPOSE_ENV) $(COMPOSE) --profile prod run --rm api migrate

# ---------------------------------------------------------------------------
# Images — the same lifecycle as .github/workflows/docker-publish.yml, locally
#
#   editions: astron-collection, astron-collection-cloud, astron-collection-console
#   bots:     astron, astron-protect, astron-logger, astron-automation,
#             astron-player, guild-center
#
# `image-build` produces the three tags a release carries and loads them locally,
# so `make docker-up <product>` runs exactly what a release would ship. Nothing
# leaves the machine unless `image-push` is asked for.
# ---------------------------------------------------------------------------
image-tags: ## Print the local image tags of the selected product
	@echo $(IMAGE_NAME):$(IMAGE_VERSION)
	@echo $(IMAGE_NAME):latest
	@echo $(IMAGE_NAME):sha-$(GIT_SHA)

image-build: ## Build the selected product's image locally (tags: v<version>, latest, sha-<sha>)
ifeq ($(BOT_DIR),)
	@echo "==> building $(IMAGE_NAME) — edition=$(PRODUCT_WORD) version=$(IMAGE_VERSION) sha=$(GIT_SHA)"
	$(DOCKER) buildx build \
		--file Dockerfile \
		--target platform \
		--build-arg ASTRON_COLLECTION_VERSION=$(IMAGE_VERSION) \
		--build-arg ASTRON_COLLECTION_FLAVOR=$(ASTRON_COLLECTION_FLAVOR) \
		--build-arg ASTRON_COLLECTION_PRODUCT=$(ASTRON_COLLECTION_PRODUCT) \
		$(IMAGE_PLATFORM_FLAG) $(IMAGE_TAGS) --load .
else
	@test -f $(BOT_DIR)/Dockerfile || { echo "==> $(BOT_DIR)/Dockerfile does not exist yet; nothing to build for '$(PRODUCT_WORD)'"; exit 1; }
	@echo "==> building $(IMAGE_NAME) — bot=$(PRODUCT_WORD) version=$(IMAGE_VERSION) sha=$(GIT_SHA)"
	# Context is the repository root: every bot image embeds the shared
	# packages/discord-framework next to its own catalogue.
	$(DOCKER) buildx build \
		--file $(BOT_DIR)/Dockerfile \
		$(IMAGE_PLATFORM_FLAG) $(IMAGE_TAGS) --load .
endif

image-pull: ## Pull the published image of the selected product
	$(DOCKER) pull $(IMAGE_NAME):$(ASTRON_COLLECTION_VERSION)

image-push: ## Push the local image tags of the selected product (docker login first)
	@for tag in $(IMAGE_NAME):$(IMAGE_VERSION) $(IMAGE_NAME):latest $(IMAGE_NAME):sha-$(GIT_SHA); do \
		echo "==> pushing $$tag"; \
		$(DOCKER) push "$$tag" || exit 1; \
	done

image-inspect: ## Show the local image, its tags and OCI labels
	$(DOCKER) image inspect \
		--format 'id={{.Id}}{{"\n"}}tags={{.RepoTags}}{{"\n"}}labels={{json .Config.Labels}}' \
		$(IMAGE_NAME):$(IMAGE_VERSION)

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
	@docker buildx version >/dev/null 2>&1 && echo "✓ Docker Buildx" || echo "✗ Docker Buildx missing"
	@echo ""
	@echo "Configuration:"
	@test -f .env && echo "✓ .env exists" || echo "✗ .env missing"
	@grep -qE '^BETTER_AUTH_SECRET=.{32,}' .env 2>/dev/null && echo "✓ BETTER_AUTH_SECRET looks strong" || echo "✗ BETTER_AUTH_SECRET missing or too short"
	@echo ""
	@echo "Product:"
	@echo "  $(PRODUCT_WORD) — $(IMAGE_NAME):$(ASTRON_COLLECTION_VERSION)"
	@echo ""
	@echo "Runtime:"
	@$(COMPOSE_PS) 2>&1 | tail -5
	@echo ""
	@echo "Storage:"
	@docker volume ls | grep astron-collection && echo "✓ Astron Collection volumes present" || echo "✗ No volumes found"

update: ## Pull the latest revision and rebuild the selected product
	@git pull
	@$(MAKE) docker-up

clean: ## Remove local build artifacts (.next, dist, tsbuildinfo, saved product)
	rm -rf apps/*/.next apps/*/dist packages/*/dist web/*/.next web/*/dist
	find . -name '*.tsbuildinfo' -not -path './node_modules/*' -delete
	rm -f $(PRODUCT_STATE)
