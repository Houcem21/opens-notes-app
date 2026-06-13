export default function AdminTaskEditPanel({
  draftTask,
  onUpdateDraft,
  onSave,
  onCancel,
}) {
  if (!draftTask) return null;

  return (
    <section className="taskEditPanel card">
      <h2>Edit Task</h2>

      <input
        className="input"
        value={draftTask.title}
        onChange={(event) => onUpdateDraft("title", event.target.value)}
      />

      <textarea
        className="textarea"
        value={draftTask.description}
        placeholder="Description..."
        onChange={(event) => onUpdateDraft("description", event.target.value)}
      />

      <select
        className="select"
        value={draftTask.priority}
        onChange={(event) => onUpdateDraft("priority", event.target.value)}
      >
        <option value="high">high</option>
        <option value="medium">medium</option>
        <option value="low">low</option>
      </select>

      <div className="taskActions">
        <button className="btn" type="button" onClick={onSave}>
          Save
        </button>

        <button className="btn btnSecondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}