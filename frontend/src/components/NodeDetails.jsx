import { useEffect, useState } from "react";

export default function NodeDetails({ node, onSave, onDelete }) {
  const [form, setForm] = useState({ title: "", notes: "", status: "not_started" });

  useEffect(() => {
    if (!node) return;
    setForm({
      title: node.title || "",
      notes: node.notes || "",
      status: node.status || "not_started",
    });
  }, [node]);

  if (!node) {
    return (
      <aside className="details">
        <h3>Node</h3>
        <div className="small muted">Select a node to edit it.</div>
      </aside>
    );
  }

  return (
    <aside className="details">
      <h3>Node</h3>

      <div className="field">
        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>

      <div className="field">
        <label>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="not_started">not_started</option>
          <option value="learning">learning</option>
          <option value="solid">solid</option>
        </select>
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea
          rows={8}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      <div className="row">
        <button onClick={() => onSave(form)}>Save</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>

      <div className="small muted">
        id: {node.id}
      </div>
    </aside>
  );
}
