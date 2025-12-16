# To Do Backend (Node + SQLite)

This backend provides a SQLite-backed data layer for tasks.

## What this provides
- Ensures `data/` directory exists
- Initializes `todo.sqlite3` with a `tasks` table on startup
- Helper functions:
  - getAllTasks()
  - createTask({ title, completed })
  - updateTask(id, updates)
  - deleteTask(id)

## Files
- db/index.js — database initialization and CRUD helpers
- data/ — created on first run

## Environment
The database is a local file at `./data/todo.sqlite3`.
Frontend environment variables (REACT_APP_*) are not required here but may be present in your environment; they are ignored by the DB layer.

## Usage
Import and call `initDatabase()` once on backend start, then use the helpers:

```js
const {
  initDatabase,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
} = require('./db');

initDatabase();

(async () => {
  const all = await getAllTasks();
  console.log(all);
})();
```

An Express API can use these helpers to implement the REST endpoints expected by the frontend.
