import AdminTaskCard from "./AdminTaskCard";

export default function AdminTaskColumn({
  column,
  tasks,
  columns,
  editingTaskId,
  draftTask,
  onStartEditing,
  onCancelEditing,
  onUpdateDraft,
  onSaveTask,
  onDeleteTask,
  onMoveTask,
}) {
  return (
    <section className="taskColumn">
      <h2>{column.title}</h2>

      {tasks.map((task) => (
        <AdminTaskCard
          key={task.id}
          task={task}
          columns={columns}
          isEditing={editingTaskId === task.id}
          draftTask={draftTask}
          onStartEditing={onStartEditing}
          onCancelEditing={onCancelEditing}
          onUpdateDraft={onUpdateDraft}
          onSaveTask={onSaveTask}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
        />
      ))}
    </section>
  );
}