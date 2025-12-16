import React from "react";

// PUBLIC_INTERFACE
export default function TodoHeader({ stats }) {
  /** Render the app header with title and stats */
  return (
    <header className="header">
      <h1 className="title">To Do</h1>
      <p className="subtitle">Simple tasks, done right.</p>
      <div className="stats" aria-label="Task statistics">
        <span className="badge primary">Total: {stats.total}</span>
        <span className="badge success">Done: {stats.completed}</span>
        <span className="badge secondary">Active: {stats.active}</span>
      </div>
    </header>
  );
}
