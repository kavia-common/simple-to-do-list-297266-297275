# To Do Frontend (React)

A modern, light-themed React To Do application with persistence via REST API.

## Features

- Add, edit (double-click), delete, mark complete
- Optimistic UI for fast interactions
- Light theme with modern styling
- Environment-based API base URL selection

## Running

- `npm start` to run the dev server
- `npm run build` for production build
- `npm test` to run tests

## Environment variables

Configure API base URL using one of:

- `REACT_APP_API_BASE`
- `REACT_APP_BACKEND_URL`

If both are absent, the app defaults to `/api` (same origin) and finally `http://localhost:4000`.

Example `.env`:

```
REACT_APP_API_BASE=http://localhost:4000
REACT_APP_NODE_ENV=development
REACT_APP_PORT=3000
```

## API Contract

The frontend expects a REST API with the following endpoints:

- `GET /todos` -> `[{ id: string|number, title: string, completed: boolean }]`
- `POST /todos` with body `{ title: string, completed?: boolean }` -> created todo
- `PUT /todos/:id` with full todo object -> updated todo
- `DELETE /todos/:id` -> 204 No Content

Ensure CORS is configured if backend runs on a different origin during development.
