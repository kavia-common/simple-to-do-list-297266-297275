import React from "react";
import "./App.css";
import "./index.css";
import { useTodos } from "./hooks/useTodos";
import TodoHeader from "./components/TodoHeader";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component for the To Do app.
   * Integrates state hook and renders modern, light-themed UI.
   */
  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    stats
  } = useTodos();

  return (
    <div className="app">
      <main className="container">
        <TodoHeader stats={stats} />
        <section className="surface">
          <TodoInput onAdd={addTodo} />

          {error ? <div className="alert error" role="alert">{error}</div> : null}
          {loading ? <div className="loading">Loading…</div> : (
            <TodoList
              todos={todos}
              onToggle={toggleComplete}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
            />
          )}
        </section>

        <footer className="footer">
          <small>
            API: <code>{process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "/api"}</code>
          </small>
        </footer>
      </main>
    </div>
  );
}

export default App;
