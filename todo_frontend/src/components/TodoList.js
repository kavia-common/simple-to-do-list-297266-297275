import React from "react";
import TodoItem from "./TodoItem";

// PUBLIC_INTERFACE
export default function TodoList({ todos, onToggle, onDelete, onUpdate }) {
  /** Render the todo list with an accessible role and empty state */
  if (!todos.length) {
    return <div className="empty">No tasks yet. Add your first task above!</div>;
  }
  return (
    <ul className="todo-list" role="list">
      {todos.map((t) => (
        <TodoItem
          key={t.id}
          todo={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}
