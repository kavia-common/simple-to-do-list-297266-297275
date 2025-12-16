import React, { useEffect, useRef, useState } from "react";

// PUBLIC_INTERFACE
export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  /**
   * Render a list item with:
   * - complete checkbox
   * - editable title
   * - delete button
   */
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === todo.title) {
      setTitle(todo.title);
      setEditing(false);
      return;
    }
    onUpdate(todo.id, { title: trimmed });
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(todo.title);
      setEditing(false);
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={!!todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`Mark ${todo.title} ${todo.completed ? "incomplete" : "complete"}`}
        />
        <span className="checkmark" />
      </label>

      {editing ? (
        <input
          ref={inputRef}
          className="edit-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKey}
          aria-label="Edit task title"
        />
      ) : (
        <span
          className="todo-title"
          onDoubleClick={() => setEditing(true)}
          title="Double click to edit"
        >
          {todo.title}
        </span>
      )}

      <div className="actions">
        {!editing && (
          <button
            className="btn ghost"
            onClick={() => setEditing(true)}
            aria-label="Edit task"
            title="Edit"
          >
            ✏️
          </button>
        )}
        <button
          className="btn danger"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
