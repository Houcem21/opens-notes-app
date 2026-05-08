import { useEffect, useMemo, useState } from "react";
import OrgGate from "../../../common/components/OrgGate";
import ErrorMessage from "../../../common/components/ErrorMessage";
import { orgGateApi } from "../../../api/orgGate";
import TaskColumn from "./TaskColumn";

export default function TaskBoard() {
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(activeOrg));
  const [error, setError] = useState("");

  const tasksByColumn = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasks
        .filter((task) => task.column_id === column.id)
        .sort((a, b) => a.position - b.position);

      return acc;
    }, {});
  }, [columns, tasks]);

  async function loadTasks() {
    if (!activeOrg) return;

    try {
      setError("");
      setLoading(true);

      const data = await orgGateApi.getOrgTasks();

      setBoard(data.board);
      setColumns(data.columns || []);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
      orgGateApi.clearOrgSession();
      setActiveOrg(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [activeOrg]);

  if (!activeOrg) {
    return (
      <OrgGate
        onSuccess={(organization) => {
          setActiveOrg(organization);
        }}
      />
    );
  }

  if (loading) {
    return <div className="page">Loading tasks...</div>;
  }

  return (
    <main className="tasksPage">
      <header className="tasksHeader">
        <div>
          <p className="tasksEyebrow">Tasks</p>
          <h1>{board?.title || "Tasks"}</h1>
        </div>
      </header>

      <ErrorMessage message={error} />

      {columns.length === 0 ? (
        <p className="mutedText">No task board available for this organization.</p>
      ) : (
        <section className="taskBoard">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              readOnly
            />
          ))}
        </section>
      )}
    </main>
  );
}