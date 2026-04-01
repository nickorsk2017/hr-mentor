.PHONY: venv system-deps install-backend-deps install-frontend-deps install-deps \
start-backend stop-backend restart-backend logs status

VENV=.venv
REPO_ROOT := $(shell cd "$(dir $(lastword $(MAKEFILE_LIST)))" && pwd)
PYTHON=$(VENV)/bin/python
PIP=$(VENV)/bin/pip
UV=$(REPO_ROOT)/$(VENV)/bin/uv

SUPERVISOR_DIR=/etc/supervisor/conf.d

venv:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip

system-deps:
	sudo apt-get update
	sudo apt-get install -y python3-venv python3-full libpq-dev gcc python3-dev 
	sudo apt-get install -y supervisor
	sudo apt-get install -y postgresql postgresql-contrib
	curl -LsSf https://astral.sh/uv/install.sh | sh

install-backend-deps: venv
	$(PIP) install "uvicorn[standard]" gunicorn uvicorn-worker uv
	cd ./backend/gateway && $(UV) sync
	cd ./backend/cv-microservice && $(UV) sync
	cd ./backend/rag-index-microservice && $(UV) sync
	cd ./backend/ranking-microservice && $(UV) sync
	cd ./backend/vacancy-microservice && $(UV) sync

# -----------------------------
# Supervisor configs
# -----------------------------

create-supervisor-configs:

	echo "[program:gateway]" | sudo tee $(SUPERVISOR_DIR)/gateway.conf
	echo "directory=$(REPO_ROOT)/backend/gateway" | sudo tee -a $(SUPERVISOR_DIR)/gateway.conf
	echo "command=$(REPO_ROOT)/backend/gateway/.venv/bin/python -m gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 1 -b 0.0.0.0:8001" | sudo tee -a $(SUPERVISOR_DIR)/gateway.conf
	echo "autostart=true" | sudo tee -a $(SUPERVISOR_DIR)/gateway.conf
	echo "autorestart=true" | sudo tee -a $(SUPERVISOR_DIR)/gateway.conf
	echo "stdout_logfile=/var/log/gateway.out.log" | sudo tee -a $(SUPERVISOR_DIR)/gateway.conf
	echo "stderr_logfile=/var/log/gateway.err.log" | sudo tee -a $(SUPERVISOR_DIR)/gateway.conf


	echo "[program:cv]" | sudo tee $(SUPERVISOR_DIR)/cv.conf
	echo "directory=$(REPO_ROOT)/backend/cv-microservice" | sudo tee -a $(SUPERVISOR_DIR)/cv.conf
	echo "command=$(REPO_ROOT)/backend/cv-microservice/.venv/bin/python -m gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 1 -b 0.0.0.0:8002" | sudo tee -a $(SUPERVISOR_DIR)/cv.conf
	echo "autostart=true" | sudo tee -a $(SUPERVISOR_DIR)/cv.conf
	echo "autorestart=true" | sudo tee -a $(SUPERVISOR_DIR)/cv.conf
	echo "stdout_logfile=/var/log/cv.out.log" | sudo tee -a $(SUPERVISOR_DIR)/cv.conf
	echo "stderr_logfile=/var/log/cv.err.log" | sudo tee -a $(SUPERVISOR_DIR)/cv.conf


	echo "[program:rag]" | sudo tee $(SUPERVISOR_DIR)/rag.conf
	echo "directory=$(REPO_ROOT)/backend/rag-index-microservice" | sudo tee -a $(SUPERVISOR_DIR)/rag.conf
	echo "command=$(REPO_ROOT)/backend/rag-index-microservice/.venv/bin/python -m gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 1 -b 0.0.0.0:8003" | sudo tee -a $(SUPERVISOR_DIR)/rag.conf
	echo "autostart=true" | sudo tee -a $(SUPERVISOR_DIR)/rag.conf
	echo "autorestart=true" | sudo tee -a $(SUPERVISOR_DIR)/rag.conf
	echo "stdout_logfile=/var/log/rag.out.log" | sudo tee -a $(SUPERVISOR_DIR)/rag.conf
	echo "stderr_logfile=/var/log/rag.err.log" | sudo tee -a $(SUPERVISOR_DIR)/rag.conf


	echo "[program:ranking]" | sudo tee $(SUPERVISOR_DIR)/ranking.conf
	echo "directory=$(REPO_ROOT)/backend/ranking-microservice" | sudo tee -a $(SUPERVISOR_DIR)/ranking.conf
	echo "command=$(REPO_ROOT)/backend/ranking-microservice/.venv/bin/python -m gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8004" | sudo tee -a $(SUPERVISOR_DIR)/ranking.conf
	echo "autostart=true" | sudo tee -a $(SUPERVISOR_DIR)/ranking.conf
	echo "autorestart=true" | sudo tee -a $(SUPERVISOR_DIR)/ranking.conf
	echo "stdout_logfile=/var/log/ranking.out.log" | sudo tee -a $(SUPERVISOR_DIR)/ranking.conf
	echo "stderr_logfile=/var/log/ranking.err.log" | sudo tee -a $(SUPERVISOR_DIR)/ranking.conf


	echo "[program:vacancy]" | sudo tee $(SUPERVISOR_DIR)/vacancy.conf
	echo "directory=$(REPO_ROOT)/backend/vacancy-microservice" | sudo tee -a $(SUPERVISOR_DIR)/vacancy.conf
	echo "command=$(REPO_ROOT)/backend/vacancy-microservice/.venv/bin/python -m gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 1 -b 0.0.0.0:8005" | sudo tee -a $(SUPERVISOR_DIR)/vacancy.conf
	echo "autostart=true" | sudo tee -a $(SUPERVISOR_DIR)/vacancy.conf
	echo "autorestart=true" | sudo tee -a $(SUPERVISOR_DIR)/vacancy.conf
	echo "stdout_logfile=/var/log/vacancy.out.log" | sudo tee -a $(SUPERVISOR_DIR)/vacancy.conf
	echo "stderr_logfile=/var/log/vacancy.err.log" | sudo tee -a $(SUPERVISOR_DIR)/vacancy.conf


reload-supervisor:
	sudo supervisorctl reread
	sudo supervisorctl update

start-backend:
	sudo supervisorctl start all

stop-backend:
	sudo supervisorctl stop all

restart-backend:
	sudo supervisorctl restart all

status-supervisor:
	supervisorctl status

clean-supervisor:
	sudo rm -f /etc/supervisor/conf.d/gateway.conf
	sudo rm -f /etc/supervisor/conf.d/cv.conf
	sudo rm -f /etc/supervisor/conf.d/rag.conf
	sudo rm -f /etc/supervisor/conf.d/ranking.conf
	sudo rm -f /etc/supervisor/conf.d/vacancy.conf
	sudo supervisorctl reread
	sudo supervisorctl update	

logs:
	sudo tail -f /var/log/gateway.err.log