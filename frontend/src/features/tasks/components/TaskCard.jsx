export default function TaskCard({
  task,
  editable = false,
  columns = [],
  onEdit,
  onDelete,
  onMove,
}) {
  return (
    <article
        className="taskCard"
        draggable={editable}
        onDragStart={(event) => {
          if (!editable) return;
          event.dataTransfer.setData("taskId", task.id);
          const ghost = document.createElement("div");
          ghost.style.width = "1px";
          ghost.style.height = "1px";
          ghost.style.opacity = "0";
          ghost.style.position = "absolute";
          ghost.style.top = "-9999px";

          document.body.appendChild(ghost);
          event.dataTransfer.setDragImage(ghost, 0, 0);

          setTimeout(() => {
            document.body.removeChild(ghost);
          }, 0);
        }}
      >
      <div className="taskCardHeader">
        <strong>{task.title}</strong>

        <span className={`priority priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="taskDescription">{task.description}</p>
      )}

      {editable && (
        <>
          <select
            className="select"
            value={task.column_id}
            onChange={(e) => onMove?.(task, e.target.value)}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>

          <div className="taskActions">
            <button
              className="btn btnSecondary"
              type="button"
              onClick={() => onEdit?.(task)}
            >
              Edit
            </button>

            <button
              className="btn btnDanger"
              type="button"
              onClick={() => onDelete?.(task.id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}