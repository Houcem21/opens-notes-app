// frontend/src/components/BlockNode.jsx
import React, { useMemo, useState } from "react";
import { Handle, Position } from "reactflow";

export default function BlockNode({ id, data, selected }) {
  const { title, isRoot, onAddChild, onDelete, onRename } = data;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title || "");
  const canEdit = !data.readOnly;
  // Keep input synced when node updates externally
  useMemo(() => {
    setValue(title || "");
  }, [title]);

  function commit() {
    const next = value.trim();
    setEditing(false);

    if (!next) {
      setValue(title || "");
      return;
    }

    if (!data.readOnly && next !== title && typeof onRename === "function") {
      onRename(id, next);
    }
  }

  return (
    <div className={`blockNode ${selected ? "selected" : ""}`}>
      {/* Optional handles (not used for edges right now, but safe) */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      {!data.readOnly && (
        <div className="blockHeader">
          {typeof onAddChild === "function" && (
            <button
              className="iconBtn"
              title="Add child"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(id);
              }}
            >
              +
            </button>
          )}

          {!isRoot && typeof onDelete === "function" && (
            <button
              className="iconBtn danger"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              ×
            </button>
          )}
        </div>
      )}

      <div className="blockBody">
        {!editing ? (
          <div
            className="blockTitle"
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!canEdit) return;
              setEditing(true);
            }}
            onClick={(e) => e.stopPropagation()}
            title={data.readOnly ? "Read" : "Double click to rename"}
          >
            {title || "Untitled"}
          </div>
        ) : (
          <input
            className="blockInput"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setEditing(false);
                setValue(title || "");
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
}
