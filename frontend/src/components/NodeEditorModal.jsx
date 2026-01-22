// frontend/src/components/NodeEditorModal.jsx
import React, { useEffect, useState } from "react";

export default function NodeEditorModal({
  open,
  node,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !node) return;
    setTitle(node.data?.title || "");
    setNotes(node.data?.notes || "");
  }, [open, node]);

  if (!open || !node) return null;

  function stop(e) {
    e.stopPropagation();
  }

  async function handleSave() {
    await onSave({ title, notes });
  }

  return (
    <div className="nodeModalOverlay" onMouseDown={onClose}>
      <div className="nodeModalPanel" onMouseDown={stop}>
        <div className="nodeModalHeader">
          <input
            className="nodeModalTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
          />
          <button className="nodeModalClose" onClick={onClose} title="Close">
            ×
          </button>
        </div>

        <textarea
          className="nodeModalNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write notes here..."
        />

        <div className="nodeModalFooter">
          <button className="nodeModalBtn" onClick={onClose} style={{color: "black"}}>
            Cancel
          </button>
          <button className="nodeModalBtn primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
