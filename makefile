.PHONY: install-backend-deps install-frontend-deps install-deps start-backend-microservices start-frontend

install-backend-deps:
	pip install "uvicorn[standard]" gunicorn uvicorn-worker
	cd ./backend/gateway && uv install
	cd ./backend/cv-microservice && uv install
	cd ./backend/rag-index-microservice && uv install
	cd ./backend/ranking-microservice && uv install
	cd ./backend/vacancy-microservice && uv install

# Ubuntu: install Node.js (NodeSource LTS) and latest pnpm, then project deps. No OS detection.
install-frontend-deps:
	sudo apt-get update
	sudo apt-get install -y ca-certificates curl gnupg
	curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo npm install -g pnpm@latest
	cd ./frontend/main-app && pnpm install

install-deps:
	$(MAKE) install-backend-deps
	$(MAKE) install-frontend-deps

start-backend-microservices:
	(cd backend/gateway && gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8001) & \
	(cd backend/cv-microservice && gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8002) & \
	(cd backend/rag-index-microservice && gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8003) & \
	(cd backend/ranking-microservice && gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8004) & \
	(cd backend/vacancy-microservice && gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8005) & \
	wait

start-frontend:
	cd ./frontend/main-app && pnpm build && pm2 start npm --name "nextjs-ai-mentor-app" -- run start

