"use strict";

/**
 * Express backend server for To Do app.
 *
 * Provides:
 * - CORS configured to allow the React frontend origin
 * - JSON body parsing
 * - Health endpoint: GET /healthz
 * - CRUD routes for tasks using the SQLite helper layer:
 *    GET    /todos
 *    POST   /todos
 *    PUT    /todos/:id
 *    DELETE /todos/:id
 *
 * Environment variables (set via .env by orchestrator):
 * - REACT_APP_API_BASE (ignored here)
 * - REACT_APP_BACKEND_URL (used to derive allowed CORS origin if present)
 * - REACT_APP_FRONTEND_URL (preferred for CORS origin)
 * - REACT_APP_PORT (frontend only; ignored here)
 * - REACT_APP_NODE_ENV (optional; if 'production' toggles some logs)
 * - REACT_APP_TRUST_PROXY (if 'true', enables app.set('trust proxy', 1))
 * - REACT_APP_LOG_LEVEL (optional string for logging verbosity)
 * - REACT_APP_HEALTHCHECK_PATH (override health endpoint path; default /healthz)
 *
 * Note: Server listens on port 4000 by default.
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { initDatabase, getAllTasks, createTask, updateTask, deleteTask } = require("./db");

// Helpers
function getAllowedOrigin() {
  // Prefer FRONTEND_URL, then REACT_APP_FRONTEND_URL, then REACT_APP_BACKEND_URL (not typical), else localhost:3000
  const frontUrl = process.env.FRONTEND_URL || process.env.REACT_APP_FRONTEND_URL;
  if (frontUrl && /^https?:\/\//i.test(frontUrl)) return frontUrl;
  const fromBackendUrl = process.env.REACT_APP_BACKEND_URL;
  if (fromBackendUrl && /^https?:\/\//i.test(fromBackendUrl)) return fromBackendUrl;
  return "http://localhost:3000";
}

function getHealthPath() {
  return process.env.HEALTHCHECK_PATH || process.env.REACT_APP_HEALTHCHECK_PATH || "/healthz";
}

// PUBLIC_INTERFACE
function createApp() {
  /** Create and configure the Express app with routes and middleware. */
  const app = express();

  // Trust proxy if enabled for deployments behind reverse proxies
  if (
    (process.env.TRUST_PROXY || process.env.REACT_APP_TRUST_PROXY || "")
      .toString()
      .toLowerCase() === "true"
  ) {
    app.set("trust proxy", 1);
  }

  // Logging
  const nodeEnv = (process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development").toLowerCase();
  const logLevel =
    process.env.LOG_LEVEL ||
    process.env.REACT_APP_LOG_LEVEL ||
    (nodeEnv === "production" ? "tiny" : "dev");
  app.use(morgan(logLevel));

  // CORS
  const allowedOrigin = getAllowedOrigin();
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
    })
  );

  // JSON body parsing
  app.use(express.json());

  // Health check
  const healthPath = getHealthPath();
  app.get(healthPath, (req, res) => {
    /**
     * Health check endpoint.
     * Returns service status and uptime metrics.
     */
    res.status(200).json({
      status: "ok",
      service: "todo-backend",
      time: new Date().toISOString(),
      uptime: process.uptime(),
      env: nodeEnv,
    });
  });

  // Routes for todos
  // GET /todos -> list
  app.get("/todos", async (req, res) => {
    /**
     * List all todos.
     * Returns array of { id, title, completed, createdAt, updatedAt }
     */
    try {
      const items = await getAllTasks();
      res.json(items);
    } catch (err) {
      console.error("[GET /todos] Error:", err.message);
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  // POST /todos -> create
  app.post("/todos", async (req, res) => {
    /**
     * Create a new todo.
     * Body: { title: string, completed?: boolean }
     */
    try {
      const { title, completed = false } = req.body || {};
      const trimmed = String(title || "").trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Title is required" });
      }
      const created = await createTask({ title: trimmed, completed: !!completed });
      res.status(201).json(created);
    } catch (err) {
      console.error("[POST /todos] Error:", err.message);
      res.status(500).json({ message: "Failed to create todo" });
    }
  });

  // PUT /todos/:id -> update full object
  app.put("/todos/:id", async (req, res) => {
    /**
     * Update an existing todo by id.
     * Body: full or partial todo object; we honor 'title' and 'completed'.
     */
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { title, completed } = req.body || {};
      const updates = {};
      if (typeof title !== "undefined") updates.title = String(title);
      if (typeof completed !== "undefined") updates.completed = !!completed;

      const updated = await updateTask(id, updates);
      if (!updated) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(updated);
    } catch (err) {
      console.error("[PUT /todos/:id] Error:", err.message);
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  // DELETE /todos/:id -> delete
  app.delete("/todos/:id", async (req, res) => {
    /**
     * Delete a todo by id.
     * Returns 204 No Content when deleted; 404 if not found.
     */
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const removed = await deleteTask(id);
      if (!removed) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.status(204).send();
    } catch (err) {
      console.error("[DELETE /todos/:id] Error:", err.message);
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Fallback 404 JSON
  app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  return app;
}

// Entry point
function main() {
  // Ensure database is initialized
  initDatabase();

  const app = createApp();
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    console.log(`[backend] Server listening on port ${port} (CORS origin: ${getAllowedOrigin()})`);
  });
}

if (require.main === module) {
  main();
}

module.exports = { createApp };
