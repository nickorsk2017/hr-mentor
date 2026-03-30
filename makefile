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
	sudo apt-get install -y supervisor
	sudo apt install -y gunicorn  python3-uvicorn
	sudo apt install python3-pip
	sudo pip install --ignore-installed --break-system-packages uvicorn-worker
	sudo apt install postgresql postgresql-contrib -y
	curl -LsSf https://astral.sh/uv/install.sh | sh

install-backend-deps: venv
	$(PIP) install "uvicorn[standard]" gunicorn uvicorn-worker uv
	cd ./backend/gateway && $(UV) sync && $(UV) add gunicorn "uvicorn[standard]"
	cd ./backend/cv-microservice && $(UV) sync && $(UV) add gunicorn "uvicorn[standard]"
	cd ./backend/rag-index-microservice && $(UV) sync && $(UV) add gunicorn "uvicorn[standard]"
	cd ./backend/ranking-microservice && $(UV) sync && $(UV) add gunicorn "uvicorn[standard]"
	cd ./backend/vacancy-microservice && $(UV) sync && $(UV) add gunicorn "uvicorn[standard]"

# Ubuntu: install Node.js (NodeSource LTS) and latest pnpm, then project deps. No OS detection.
install-frontend-deps:
	sudo apt-get update
	sudo apt-get install -y ca-certificates curl gnupg
	curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo npm install -g pnpm@latest
	sudo npm install -g pm2
	pm2 startup
	cd ./frontend/main-app && pnpm install

install-deps:
	$(MAKE) system-deps
	$(MAKE) install-backend-deps
	$(MAKE) install-frontend-deps

start-backend-microservices:
	(cd backend/gateway && $(UV) run gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8001) & \
	(cd backend/cv-microservice && $(UV) run gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8002) & \
	(cd backend/rag-index-microservice && $(UV) run gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8003) & \
	(cd backend/ranking-microservice && $(UV) run gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8004) & \
	(cd backend/vacancy-microservice && $(UV) run gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8005) & \
	wait

stop-backend-microservices:
	pkill -f gunicorn || true

list-backend-processes:
	ps aux | grep gunicorn | grep -v grep

start-frontend:
	cd ./frontend/main-app && pnpm build
	pm2 delete nextjs-ai-mentor-app || true
	pm2 start npm --namespace "nextjs-ai-mentor-app " -- start
	pm2 save

run-migrations:
	cd ./backend/_common/db && $(UV) run alembic upgrade head