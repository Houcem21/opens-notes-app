import TaskCard from "./TaskCard";

export default function TaskColumn({
  column,
  tasks,
  editable = false,
  columns = [],
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onDropTask,
}) {
  return (
    <section className="taskColumn"
        onDragOver={(event) => {
        if (!editable) return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!editable) return;

        event.preventDefault();

        const taskId = event.dataTransfer.getData("taskId");
        if (!taskId) return;

        onDropTask?.(taskId, column.id);
      }}>
      <h2>{column.title}</h2>

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          editable={editable}
          columns={columns}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onMove={onMoveTask}
        />
      ))}
    </section>
  );
}