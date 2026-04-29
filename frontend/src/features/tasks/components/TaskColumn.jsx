import { useState } from "react";
import TaskCard from "./TaskCard";

export default function TaskColumn({
  column,
  tasks,
  canCreateTask,
  onCreateTask,
  onMoveTaskToColumn,
  onUpdateTask,
  onDeleteTask,
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  async function handleCreateTask(e) {
    e.preventDefault();

    const title = newTaskTitle.trim();
    if (!title) return;

    await onCreateTask(column.id, title);
    setNewTaskTitle("");
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    await onMoveTaskToColumn(taskId, column.id);
  }

  return (
    <section
      className={`taskColumn ${isDragOver ? "dragOver" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2>{column.title}</h2>

      <div className="taskList">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>

      {canCreateTask && (
        <form className="newTaskForm" onSubmit={handleCreateTask}>
          <input
            value={newTaskTitle}
            placeholder="New task..."
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button className="btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}