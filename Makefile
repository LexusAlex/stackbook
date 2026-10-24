.DEFAULT_GOAL := help

COMPOSE ?= docker compose

.PHONY: help up down build logs restart shell check

help:
	@echo "make up       Build and start Stackbook in the background"
	@echo "make down     Stop and remove the Stackbook container"
	@echo "make build    Build the Docker image"
	@echo "make logs     Follow the container logs"
	@echo "make restart  Restart the running service"
	@echo "make shell    Open a shell in the running service"
	@echo "make check    Run type checks, tests and site build in a temporary container"

up:
	$(COMPOSE) up --build --detach

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

logs:
	$(COMPOSE) logs --follow docs

restart:
	$(COMPOSE) restart docs

shell:
	$(COMPOSE) exec docs sh

check:
	$(COMPOSE) run --build --rm --no-deps docs pnpm check
