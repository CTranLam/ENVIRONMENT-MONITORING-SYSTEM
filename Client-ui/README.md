# Environment Monitoring System — Client UI

React 18 + TypeScript frontend, built with Vite. Coding conventions live in `AGENTS.md`.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Tất cả các trang (Dashboard, Sensor Data, Action History, Profile) kết nối trực tiếp với Backend REST API và STOMP WebSocket, không sử dụng mock fallback. Khi backend không khả dụng, giao diện sẽ hiển thị trạng thái lỗi rõ ràng.

## Docker deployment

`docker-compose.yml` builds the bundle and serves the static assets:

```bash
docker compose up -d --build
```

The frontend is published on `CLIENT_PORT` (default `8082`).

Calls to the backend API are made directly from the browser to `VITE_API_BASE_URL` (default `http://localhost:8080/api`). Ensure the backend has CORS enabled to accept requests from the frontend origin.

## Environment variables

| Variable | Where | Description | Default |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | build time | Backend API base URL | `http://localhost:8080/api` |
| `VITE_APP_TITLE` | build time | Document title | `Environment Monitoring System` |
| `CLIENT_PORT` | runtime | Host port for the frontend | `8082` |
