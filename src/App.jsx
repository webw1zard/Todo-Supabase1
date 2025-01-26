import React, { useState, useEffect } from "react";
import { supabase } from "./supabasecfg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "animate.css"; // For beautiful animations

const App = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const { data } = await supabase
        .from("todos")
        .select("*")
        .order("id", { ascending: true });
      setTodos(data || []);
    } catch (error) {
      toast.error("Failed to fetch tasks.", {
        icon: "🚫",
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    const subscription = supabase
      .channel("public:todos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              setTodos((prev) => [...prev, payload.new]);
              break;
            case "UPDATE":
              setTodos((prev) =>
                prev.map((todo) =>
                  todo.id === payload.new.id ? payload.new : todo
                )
              );
              break;
            case "DELETE":
              setTodos((prev) =>
                prev.filter((todo) => todo.id !== payload.old.id)
              );
              break;
            default:
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  useEffect(() => {
    fetchTodos();
    const unsubscribe = setupRealtime();

    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (!task.trim()) return;
    try {
      await supabase.from("todos").insert([{ task: task.trim(), done: false }]);
      setTask("");
      toast.success("Task added successfully!", {
        icon: "🎉",
        theme: "colored",
      });
    } catch (error) {
      toast.error("Failed to add task.", {
        icon: "🚫",
        theme: "colored",
      });
    }
  };

  const editTodo = async () => {
    if (!task.trim() || !editing) return;
    try {
      await supabase
        .from("todos")
        .update({ task: task.trim() })
        .eq("id", editing);
      setTask("");
      setEditing(null);
      toast.success("Task updated successfully!", {
        icon: "✏️",
        theme: "colored",
      });
    } catch (error) {
      toast.error("Failed to update task.", {
        icon: "🚫",
        theme: "colored",
      });
    }
  };

  const deleteTodo = async (id) => {
    try {
      await supabase.from("todos").delete().eq("id", id);
      toast.info("Task deleted.", {
        icon: "🗑️",
        theme: "colored",
      });
    } catch (error) {
      toast.error("Failed to delete task.", {
        icon: "🚫",
        theme: "colored",
      });
    }
  };

  const toggleTodo = async (id, done) => {
    try {
      await supabase.from("todos").update({ done: !done }).eq("id", id);
      toast.success("Task status updated!", {
        icon: "✅",
        theme: "colored",
      });
    } catch (error) {
      toast.error("Failed to update task status.", {
        icon: "🚫",
        theme: "colored",
      });
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="toast-container animate__animated animate__slideInRight"

        
      />
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

      {loading ? (
        <ul className="list-group">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="list-group-item">
              <Skeleton height={30} />
            </li>
          ))}
        </ul>
      ) : (
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
      )}
    </div>
  );
};

export default App;
