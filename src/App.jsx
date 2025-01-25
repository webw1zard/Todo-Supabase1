import React, { useState, useEffect } from "react";
import { supabase } from "./supabasecfg";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editing, setEditing] = useState(null);

  const fetchTodos = async () => {
    try {
      const { data } = await supabase
        .from("todos")
        .select("*")
        .order("id", { ascending: true });
      setTodos(data || []);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!task.trim()) return;
    try {
      const { data } = await supabase
        .from("todos")
        .insert([{ task: task.trim(), done: false }])
        .select()
        .single();
      setTodos((prev) => [...prev, data]);
      setTask("");
    } catch (error) {
    }
  };

  const editTodo = async () => {
    if (!task.trim() || !editing) return;
    try {
      const { data, error } = await supabase
        .from("todos")
        .update({ task: task.trim() })
        .eq("id", editing)
        .select()
        .single();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === editing ? data : todo))
      );
      setTask("");
      setEditing(null);
    } catch (error) {
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
    }
  };

  const toggleTodo = async (id, done) => {
    try {
      const { data } = await supabase
        .from("todos")
        .update({ done: !done })
        .eq("id", id)
        .select()
        .single();
      setTodos((prev) => prev.map((todo) => (todo.id === id ? data : todo)));
    } catch (error) {
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Todo List</h1>
      <div className="d-flex justify-content-center mb-4">
        <div className="input-group w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Add a new task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button
            className={`btn btn-${editing ? "warning" : "primary"}`}
            onClick={editing ? editTodo : addTodo}
          >
            {editing ? "Edit Todo" : "Add Todo"}
          </button>
        </div>
      </div>

      <ul className="list-group">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                className="form-check-input"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id, todo.done)}
              />
              <span
                style={{
                  textDecoration: todo.done ? "line-through" : "none",
                  marginLeft: "10px",
                }}
              >
                {todo.task}
              </span>
            </div>
            <div>
              <button
                className="btn btn-warning btn-sm mx-1"
                onClick={() => {
                  setTask(todo.task);
                  setEditing(todo.id);
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
