.PHONY: venv system-deps install-backend-deps install-frontend-deps install-deps start-backend-microservices start-frontend

VENV=.venv
REPO_ROOT := $(shell cd "$(dir $(lastword $(MAKEFILE_LIST)))" && pwd)
PYTHON=$(VENV)/bin/python
PIP=$(VENV)/bin/pip
UV=$(REPO_ROOT)/$(VENV)/bin/uv

venv:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip

system-deps:
	sudo apt-get update
	sudo apt-get install -y python3-venv python3-full libpq-dev gcc python3-dev

install-backend-deps: venv
	$(PIP) install "uvicorn[standard]" gunicorn uvicorn-worker uv
	cd ./backend/gateway && $(UV) sync
	cd ./backend/cv-microservice && $(UV) sync
	cd ./backend/rag-index-microservice && $(UV) sync
	cd ./backend/ranking-microservice && $(UV) sync
	cd ./backend/vacancy-microservice && $(UV) sync

# Ubuntu: install Node.js (NodeSource LTS) and latest pnpm, then project deps. No OS detection.
install-frontend-deps:
	sudo apt-get update
	sudo apt-get install -y ca-certificates curl gnupg
	curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo npm install -g pnpm@latest
	sudo npm install -g pm2
	cd ./frontend/main-app && pnpm install

install-deps:
	$(MAKE) system-deps
	$(MAKE) install-backend-deps
	$(MAKE) install-frontend-deps

start-backend-microservices:
	(cd backend/gateway && $(VENV)/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8001) & \
	(cd backend/cv-microservice && $(VENV)/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8002) & \
	(cd backend/rag-index-microservice && $(VENV)/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8003) & \
	(cd backend/ranking-microservice && $(VENV)/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8004) & \
	(cd backend/vacancy-microservice && $(VENV)/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8005) & \
	wait

start-frontend:
	cd ./frontend/main-app && pnpm build && pm2 start npm --name "nextjs-ai-mentor-app" -- run start
