# Shell setup
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

# Project paths
PROJECT_ROOT := $(shell pwd)
BACKEND_DIR := backend
FRONTEND_DIR := frontend

.PHONY: help init backend-init frontend-init dev backend-dev frontend-dev reset clean-db seed-db test backend-test frontend-test

.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make init          Initialize environment (backend & frontend)"
	@echo "  make dev           Start development servers (backend & frontend)"
	@echo "  make reset         Reset database (clean & seed)"
	@echo "  make test          Run tests (backend & frontend)"

# Initialization
init: backend-init frontend-init

backend-init:
	@echo "Initializing Backend..."
	cd $(BACKEND_DIR) && uv sync

frontend-init:
	@echo "Initializing Frontend..."
	cd $(FRONTEND_DIR) && npm ci

# Development
dev:
	$(MAKE) -j 2 backend-dev frontend-dev

backend-dev:
	@echo "Starting Backend..."
	cd $(BACKEND_DIR) && uv run uvicorn app.main:app --reload

frontend-dev:
	@echo "Starting Frontend..."
	cd $(FRONTEND_DIR) && npm run dev -- --clearScreen false


# Database Management
reset: clean-db seed-db

clean-db:
	@echo "Removing database..."
	rm -f db/vibecrm.sqlite

seed-db:
	@echo "Seeding database..."
	cd $(BACKEND_DIR) && uv run python -c "from app.db.init_db import init_db; from app.db.seeds import seed_db; from app.db.session import SessionLocal; init_db(); db = SessionLocal(); seed_db(db); db.close()"

# Testing
test: backend-test frontend-test

backend-test:
	@echo "Running Backend Tests..."
	cd $(BACKEND_DIR) && uv run pytest

frontend-test:
	@echo "Running Frontend Tests..."
	cd $(FRONTEND_DIR) && npm run test -- --run
