import { useState } from "react";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "medium",
  });

  function handleDragStart(e) {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
  }

  async function saveChanges() {
    const title = draft.title.trim();
    if (!title) return;

    await onUpdate(task.id, {
      title,
      description: draft.description,
      priority: draft.priority,
    });

    setEditing(false);
  }

  if (editing) {
    return (
      <div className={`taskCard priority-${draft.priority}`}>
        <input
          className="taskEditTitle"
          value={draft.title}
          onChange={(e) =>
            setDraft((current) => ({ ...current, title: e.target.value }))
          }
        />

        <textarea
          className="taskEditDescription"
          value={draft.description}
          placeholder="Description..."
          onChange={(e) =>
            setDraft((current) => ({
              ...current,
              description: e.target.value,
            }))
          }
        />

        <select
          className="taskPrioritySelect"
          value={draft.priority}
          onChange={(e) =>
            setDraft((current) => ({ ...current, priority: e.target.value }))
          }
        >
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>

        <div className="taskCardActions">
          <button className="btn" onClick={saveChanges}>Save</button>
          <button className="btn btnSecondary" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <article
      className={`taskCard priority-${task.priority}`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="taskCardTop">
        <span className="priorityBadge">{task.priority}</span>
        <button className="btn btnSecondary" onClick={() => setEditing(true)}>Edit</button>
      </div>

      <h3>{task.title}</h3>

      {task.description && (
        <p className="taskDescription">{task.description}</p>
      )}

      <div className="taskCardFooter">
        {task.dueDate && <span>{task.dueDate}</span>}
        <button className="btn btnDanger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}