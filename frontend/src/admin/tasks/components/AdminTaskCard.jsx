export default function AdminTaskCard({
  task,
  columns,
  isEditing,
  draftTask,
  onStartEditing,
  onCancelEditing,
  onUpdateDraft,
  onSaveTask,
  onDeleteTask,
  onMoveTask,
}) {
  if (isEditing) {
    return (
      <article className="taskCard">
        <input
          className="input"
          value={draftTask.title}
          onChange={(e) => onUpdateDraft("title", e.target.value)}
        />

        <textarea
          className="textarea"
          value={draftTask.description}
          placeholder="Description..."
          onChange={(e) => onUpdateDraft("description", e.target.value)}
        />

        <select
          className="select"
          value={draftTask.priority}
          onChange={(e) => onUpdateDraft("priority", e.target.value)}
        >
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>

        <div className="taskActions">
          <button className="btn" type="button" onClick={onSaveTask}>
            Save
          </button>

          <button className="btn btnSecondary" type="button" onClick={onCancelEditing}>
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="taskCard">
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
        onChange={(e) => onMoveTask(task, e.target.value)}
      >
        {columns.map((columnOption) => (
          <option key={columnOption.id} value={columnOption.id}>
            {columnOption.title}
          </option>
        ))}
      </select>

      <div className="taskActions">
        <button
          className="btn btnSecondary"
          type="button"
          onClick={() => onStartEditing(task)}
        >
          Edit
        </button>

        <button
          className="btn btnDanger"
          type="button"
          onClick={() => onDeleteTask(task.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}