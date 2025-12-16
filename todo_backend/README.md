# To Do Backend (Node + Express + SQLite)

This backend exposes a REST API for a To Do app, backed by a local SQLite database.

## What this provides

- Ensures `data/` directory exists
- Initializes `todo.sqlite3` with a `tasks` table on startup
- Express server on port `4000` by default
- CORS configured to allow the frontend origin
- Health check at `/healthz` (override via `REACT_APP_HEALTHCHECK_PATH`)
- CRUD endpoints:
  - GET `/todos` → list tasks
  - POST `/todos` → create task `{ title: string, completed?: boolean }`
  - PUT `/todos/:id` → update task (honors `title`, `completed`)
  - DELETE `/todos/:id` → delete task (204 on success)

## Files

- server.js — Express app with routes
- db/index.js — database initialization and CRUD helpers
- data/ — created on first run for SQLite file

## Environment

The database is a local file at `./data/todo.sqlite3`.

Supported environment variables (injected by the orchestrator, do not hardcode in code):
- `REACT_APP_FRONTEND_URL` — preferred for CORS origin (e.g., http://localhost:3000)
- `REACT_APP_BACKEND_URL` — alternative for CORS origin if needed
- `REACT_APP_NODE_ENV` — toggles logging style (defaults to NODE_ENV or 'development')
- `REACT_APP_TRUST_PROXY` — if 'true', enables trust proxy for reverse proxy setups
- `REACT_APP_HEALTHCHECK_PATH` — override health endpoint path (default `/healthz`)
- `PORT` — override server port (default `4000`)

Example `.env` (for reference only; do not commit secrets):
```
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_NODE_ENV=development
REACT_APP_HEALTHCHECK_PATH=/healthz
PORT=4000
```

## Run

- Install deps: `npm install`
- Start: `npm start`
- Dev: `npm run dev`

## API Contract

Matches frontend expectations:

- `GET /todos` -> `[{ id, title, completed, createdAt, updatedAt }]`
- `POST /todos` with body `{ title, completed? }` -> created todo
- `PUT /todos/:id` with full or partial todo -> updated todo
- `DELETE /todos/:id` -> 204 No Content

```bash
curl -s http://localhost:4000/healthz
curl -s http://localhost:4000/todos
```
