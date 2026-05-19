import { useMemo } from "react";
import TaskColumn from "./TaskColumn";

function groupTasksByColumn(columns, tasks) {
  return columns.reduce((groups, column) => {
    groups[column.id] = tasks
      .filter((task) => task.column_id === column.id)
      .sort((a, b) => a.position - b.position);

    return groups;
  }, {});
}

export default function TaskBoard({
  columns = [],
  tasks = [],
  tasksByColumn,
  editable = false,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onDropTask
}) {
  const groupedTasks = useMemo(() => {
    return tasksByColumn || groupTasksByColumn(columns, tasks);
  }, [columns, tasks, tasksByColumn]);

  if (!columns.length) {
    return <p className="mutedText">No task board available.</p>;
  }

  return (
    <section className="taskBoard">
      {columns.map((column) => (
        <TaskColumn
          key={column.id}
          column={column}
          tasks={groupedTasks[column.id] || []}
          columns={columns}
          editable={editable}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
          onDropTask={onDropTask}
        />
      ))}
    </section>
  );
}