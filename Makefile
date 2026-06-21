.PHONY: dev dev-build down migrate migrate-down generate seed \
        test test-backend test-ml test-frontend \
        lint lint-backend lint-ml lint-frontend \
        build build-backend build-ml build-frontend \
        logs clean

# ── Environment ───────────────────────────────────────────────────────────────
include .env
export

# ── Development ───────────────────────────────────────────────────────────────

dev: ## Start all services in development mode
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

dev-build: ## Build and start all services in development mode
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

down: ## Stop all services
	docker compose down

down-volumes: ## Stop all services and remove volumes (destructive)
	docker compose down -v

# ── Database ──────────────────────────────────────────────────────────────────

migrate: ## Run all pending database migrations
	docker compose run --rm backend /app/api -migrate-only

migrate-down: ## Roll back the last migration
	docker compose run --rm backend /app/api -migrate-down

migrate-fresh: ## Drop and recreate all tables (destructive)
	docker compose run --rm backend /app/api -migrate-fresh

# ── Code Generation ───────────────────────────────────────────────────────────

generate: ## Regenerate sqlc Go bindings
	cd backend && sqlc generate

# ── Testing ───────────────────────────────────────────────────────────────────

test: test-backend test-ml ## Run all tests

test-backend:
	cd backend && go test ./... -v -race -coverprofile=coverage.out

test-ml:
	cd ml && python -m pytest tests/ -v --tb=short

test-frontend:
	cd frontend && pnpm test

# ── Linting ───────────────────────────────────────────────────────────────────

lint: lint-backend lint-ml lint-frontend ## Run all linters

lint-backend:
	cd backend && golangci-lint run ./...

lint-ml:
	cd ml && ruff check app/ && mypy app/

lint-frontend:
	cd frontend && pnpm lint

# ── Build ──────────────────────────────────────────────────────────────────────

build: ## Build all Docker images
	docker compose build

# ── Utilities ─────────────────────────────────────────────────────────────────

logs: ## Tail all service logs
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-ml:
	docker compose logs -f ml

logs-frontend:
	docker compose logs -f frontend

seed: ## Seed development database with demo data
	docker compose run --rm backend /app/api -seed

simulator: ## Run data simulator (requires services running)
	docker compose run --rm simulator

clean: ## Remove build artifacts
	rm -f backend/bin/*
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
