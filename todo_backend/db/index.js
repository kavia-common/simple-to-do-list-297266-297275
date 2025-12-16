"use strict";

/**
 * SQLite database layer for To Do backend.
 * - Ensures data directory exists
 * - Initializes SQLite DB and tasks table on startup
 * - Exposes helper functions for CRUD operations
 *
 * Environment:
 * - Uses REACT_APP_NODE_ENV (optional) only for logging tweaks if present in env
 * - DB file path is "./data/todo.sqlite3" relative to this db module
 */

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DATA_DIR = path.resolve(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "todo.sqlite3");

let dbInstance = null;

/**
 * Ensure that the ./data directory exists for persisting the SQLite database.
 */
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Fail fast if directory cannot be created
    console.error("[DB] Failed to ensure data directory:", err.message);
    throw err;
  }
}

/**
 * Initialize database connection and create the tasks table if it does not exist.
 * This function is idempotent and safe to call multiple times.
 */
function initDatabase() {
  if (dbInstance) return dbInstance;

  ensureDataDir();

  dbInstance = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error("[DB] Error opening database:", err.message);
      throw err;
    }
  });

  // Enable foreign keys and create schema
  dbInstance.serialize(() => {
    dbInstance.run("PRAGMA foreign_keys = ON;");
    dbInstance.run(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME
      );`,
      (err) => {
        if (err) {
          console.error("[DB] Error creating tasks table:", err.message);
          throw err;
        }
      }
    );
    // Helpful index for sorting/queries
    dbInstance.run(
      `CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);`
    );
  });

  return dbInstance;
}

/**
 * Convert a DB row into an API-friendly todo object.
 */
function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    completed: !!row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at || null,
  };
}

// PUBLIC_INTERFACE
async function getAllTasks() {
  /** Retrieve all tasks sorted by created_at DESC. */
  const db = initDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY created_at DESC, id DESC;",
      [],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows.map(mapRow));
      }
    );
  });
}

// PUBLIC_INTERFACE
async function createTask({ title, completed = false }) {
  /** Create a new task with given title and optional completed boolean. */
  const db = initDatabase();
  const comp = completed ? 1 : 0;
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      "INSERT INTO tasks (title, completed, created_at) VALUES (?, ?, ?);",
      [String(title || "").trim(), comp, now],
      function (err) {
        if (err) {
          return reject(err);
        }
        const id = this.lastID;
        db.get(
          "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?;",
          [id],
          (getErr, row) => {
            if (getErr) return reject(getErr);
            resolve(mapRow(row));
          }
        );
      }
    );
  });
}

// PUBLIC_INTERFACE
async function updateTask(id, updates) {
  /**
   * Update a task by id.
   * Allowed updates: title, completed.
   * Returns the updated task.
   */
  const db = initDatabase();
  const fields = [];
  const params = [];
  const now = new Date().toISOString();

  if (Object.prototype.hasOwnProperty.call(updates, "title")) {
    fields.push("title = ?");
    params.push(String(updates.title || "").trim());
  }
  if (Object.prototype.hasOwnProperty.call(updates, "completed")) {
    fields.push("completed = ?");
    params.push(updates.completed ? 1 : 0);
  }

  // Always update updated_at if any fields are modified
  fields.push("updated_at = ?");
  params.push(now);

  if (fields.length === 1) {
    // Only updated_at would change, which is meaningless if no fields requested
    return getTaskById(id);
  }

  params.push(id);

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?;`,
      params,
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) {
          // no task found
          return resolve(null);
        }
        db.get(
          "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?;",
          [id],
          (getErr, row) => {
            if (getErr) return reject(getErr);
            resolve(mapRow(row));
          }
        );
      }
    );
  });
}

/**
 * Get a task by id.
 * Internal helper.
 */
function getTaskById(id) {
  const db = initDatabase();
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?;",
      [id],
      (err, row) => {
        if (err) return reject(err);
        resolve(mapRow(row));
      }
    );
  });
}

// PUBLIC_INTERFACE
async function deleteTask(id) {
  /** Delete task by id. Returns true if deleted, false if not found. */
  const db = initDatabase();
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM tasks WHERE id = ?;", [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

module.exports = {
  initDatabase,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};
