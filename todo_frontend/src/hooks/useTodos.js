import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

// PUBLIC_INTERFACE
export function useTodos() {
  /**
   * Manage To Do list with server persistence.
   * Exposes:
   * - todos, loading, error
   * - addTodo(title)
   * - updateTodo(id, updates)
   * - toggleComplete(id)
   * - deleteTodo(id)
   * Handles optimistic UI where appropriate with rollback on error.
   */
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/todos", { method: "GET" });
      setTodos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // PUBLIC_INTERFACE
  const addTodo = useCallback(async (title) => {
    const newTodo = { title: title.trim(), completed: false };
    if (!newTodo.title) return;
    try {
      const created = await apiRequest("/todos", {
        method: "POST",
        body: JSON.stringify(newTodo)
      });
      setTodos((prev) => [created, ...prev]);
    } catch (e) {
      setError(e.message || "Failed to add todo");
    }
  }, []);

  // PUBLIC_INTERFACE
  const updateTodo = useCallback(async (id, updates) => {
    setError("");
    // Optimistic update
    const prev = todos;
    const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTodos(next);
    try {
      const updated = await apiRequest(`/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify(next.find((t) => t.id === id))
      });
      setTodos((curr) => curr.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setTodos(prev); // rollback
      setError(e.message || "Failed to update todo");
    }
  }, [todos]);

  // PUBLIC_INTERFACE
  const toggleComplete = useCallback(async (id) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    await updateTodo(id, { completed: !target.completed });
  }, [todos, updateTodo]);

  // PUBLIC_INTERFACE
  const deleteTodo = useCallback(async (id) => {
    setError("");
    const prev = todos;
    setTodos((curr) => curr.filter((t) => t.id !== id));
    try {
      await apiRequest(`/todos/${id}`, { method: "DELETE" });
    } catch (e) {
      setTodos(prev); // rollback
      setError(e.message || "Failed to delete todo");
    }
  }, [todos]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    stats,
    refetch: fetchTodos
  };
}
