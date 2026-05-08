import { useEffect, useMemo, useState } from "react";
import OrgGate from "../../../common/components/OrgGate";
import AdminGate from "../../../common/components/AdminGate";
import ErrorMessage from "../../../common/components/ErrorMessage";
import { orgGateApi } from "../../../api/orgGate";
import "../../../features/tasks/styles/tasks.css";

export default function AdminTaskBoard() {
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());
  const [adminToken, setAdminToken] = useState(orgGateApi.getAdminToken());

  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [draftTask, setDraftTask] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(activeOrg && adminToken));

  const todoColumn = columns[0];

  const tasksByColumn = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasks
        .filter((task) => task.column_id === column.id)
        .sort((a, b) => a.position - b.position);

      return acc;
    }, {});
  }, [columns, tasks]);

  async function loadBoard() {
    if (!activeOrg || !adminToken) return;

    try {
      setError("");
      setLoading(true);

      const data = await orgGateApi.getOrgTasks();

      setBoard(data.board);
      setColumns(data.columns || []);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, [activeOrg, adminToken]);

  async function createTask(e) {
    e.preventDefault();

    if (!todoColumn) return;
    if (!newTaskTitle.trim()) return;

    try {
      setError("");

      const todoTasks = tasksByColumn[todoColumn.id] || [];

      const created = await orgGateApi.saveAdminTask({
        title: newTaskTitle.trim(),
        description: "",
        priority: "medium",
        columnId: todoColumn.id,
        position: todoTasks.length,
      });

      setTasks((current) => [...current, created]);
      setNewTaskTitle("");
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setDraftTask({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      columnId: task.column_id,
      position: task.position || 0,
    });
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setDraftTask(null);
  }

  function updateDraft(field, value) {
    setDraftTask((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveTask() {
    if (!draftTask) return;

    try {
      setError("");

      const saved = await orgGateApi.saveAdminTask(draftTask);

      setTasks((current) =>
        current.map((task) => (task.id === saved.id ? saved : task))
      );

      cancelEditing();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(taskId) {
    if (!confirm("Diese Aufgabe löschen?")) return;

    try {
      setError("");

      await orgGateApi.deleteAdminTask(taskId);

      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function moveTask(task, targetColumnId) {
    if (task.column_id === targetColumnId) return;

    try {
      setError("");

      const targetTasks = tasksByColumn[targetColumnId] || [];

      const saved = await orgGateApi.saveAdminTask({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority || "medium",
        columnId: targetColumnId,
        position: targetTasks.length,
      });

      setTasks((current) =>
        current.map((item) => (item.id === saved.id ? saved : item))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  if (!activeOrg) {
    return (
      <OrgGate
        onSuccess={(organization) => {
          setActiveOrg(organization);
        }}
      />
    );
  }

  if (!adminToken) {
    return (
      <AdminGate
        onSuccess={(token) => {
          setAdminToken(token);
        }}
      />
    );
  }

  if (loading) {
    return <div className="page">Loading admin tasks...</div>;
  }

  return (
    <main className="tasksPage">
      <header className="tasksHeader">
        <div>
          <p className="tasksEyebrow">Admin Tasks</p>
          <h1>{board?.title || "Tasks"}</h1>
        </div>

        <button
          className="btn btnSecondary"
          onClick={() => {
            orgGateApi.clearAdminSession();
            window.location.reload();
          }}
        >
          Logout Admin
        </button>
      </header>

      <ErrorMessage message={error} />

      {todoColumn && (
        <form className="adminTaskCreateForm" onSubmit={createTask}>
          <input
            className="input"
            value={newTaskTitle}
            placeholder="New task..."
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button className="btn" type="submit">
            Add to To Do
          </button>
        </form>
      )}

      {columns.length === 0 ? (
        <p className="mutedText">No task board available.</p>
      ) : (
        <section className="taskBoard">
          {columns.map((column) => (
            <section className="taskColumn" key={column.id}>
              <h2>{column.title}</h2>

              {(tasksByColumn[column.id] || []).map((task) => {
                const isEditing = editingTaskId === task.id;

                return (
                  <article className="taskCard" key={task.id}>
                    {isEditing ? (
                      <>
                        <input
                          className="input"
                          value={draftTask.title}
                          onChange={(e) =>
                            updateDraft("title", e.target.value)
                          }
                        />

                        <textarea
                          className="textarea"
                          value={draftTask.description}
                          placeholder="Description..."
                          onChange={(e) =>
                            updateDraft("description", e.target.value)
                          }
                        />

                        <select
                          className="select"
                          value={draftTask.priority}
                          onChange={(e) =>
                            updateDraft("priority", e.target.value)
                          }
                        >
                          <option value="high">high</option>
                          <option value="medium">medium</option>
                          <option value="low">low</option>
                        </select>

                        <div className="taskActions">
                          <button className="btn" type="button" onClick={saveTask}>
                            Save
                          </button>
                          <button
                            className="btn btnSecondary"
                            type="button"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="taskCardHeader">
                        <strong>{task.title}</strong>
                        <span className={`priority priority-${task.priority}`}>
                            {task.priority}
                        </span>
                        </div>

                        {task.description && (
                        <p className="taskDescription">{task.description}</p>
                        )}

                        <select
                          className="select"
                          value={task.column_id}
                          onChange={(e) => moveTask(task, e.target.value)}
                        >
                          {columns.map((columnOption) => (
                            <option
                              key={columnOption.id}
                              value={columnOption.id}
                            >
                              {columnOption.title}
                            </option>
                          ))}
                        </select>

                        <div className="taskActions">
                          <button
                            className="btn btnSecondary"
                            type="button"
                            onClick={() => startEditing(task)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btnDanger"
                            type="button"
                            onClick={() => deleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </section>
          ))}
        </section>
      )}
    </main>
  );
}