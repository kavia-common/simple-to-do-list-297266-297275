import React, { useState } from "react";

// PUBLIC_INTERFACE
export default function TodoInput({ onAdd }) {
  /** Input form for creating a new task */
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const title = value.trim();
    if (!title) return;
    onAdd(title);
    setValue("");
  };

  return (
    <form className="todo-input" onSubmit={submit} aria-label="Add new task">
      <input
        className="input"
        type="text"
        placeholder="What do you need to do?"
        aria-label="New task title"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="btn" type="submit" aria-label="Add task">
        Add
      </button>
    </form>
  );
}
