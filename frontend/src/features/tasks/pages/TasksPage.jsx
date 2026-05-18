import { useEffect, useState } from "react";
import { orgGateApi } from "../../../api";
import TaskBoard from "../components/TaskBoard";
import "../styles/tasks.css";
import LoadingScreen from "../../../common/components/loading/LoadingScreen";

import EmptyState from "../../../common/ui/EmptyState";

export default function TasksPage() {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setError("");
      setLoading(true);

      const data = await orgGateApi.getOrgTasks();

      setColumns(data.columns || []);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && (
        <main className="tasksPage">
          <header className="tasksHeader">
            <div>
              <p className="tasksEyebrow">Tasks</p>
              <h1>Current Progress</h1>
            </div>
          </header>
          {!loading && tasks.length === 0 ? (
            <EmptyState
                eyebrow="Task Boards"
                title="No tasks yet"
                description="Create your first task board from the admin workspace."
                />
            ) :(
            <TaskBoard columns={columns} tasks={tasks} />
          )}
        </main>
      )}
    </>
  );
}