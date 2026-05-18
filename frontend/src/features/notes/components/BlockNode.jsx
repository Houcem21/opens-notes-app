import { memo, useEffect, useState } from "react";
import { Handle, Position } from "reactflow";

function BlockNode({ id, data, selected }) {
  const {
    title,
    notes,
    isRoot,
    readOnly,
    onAddChild,
    onDelete,
    onRename,
    onUpdateNotes,
  } = data;

  const canEdit = !readOnly;

  const [localTitle, setLocalTitle] = useState(title || "");
  const [localNotes, setLocalNotes] = useState(notes || "");

  useEffect(() => {
    setLocalTitle(title || "");
    setLocalNotes(notes || "");
  }, [title, notes]);

  function saveTitle() {
    const nextTitle = localTitle.trim();

    if (!nextTitle) {
      setLocalTitle(title || "");
      return;
    }

    if (nextTitle !== title) {
      onRename?.(id, nextTitle);
    }
  }

  function saveNotes() {
    if ((localNotes || "") !== (notes || "")) {
      onUpdateNotes?.(id, localNotes);
    }
  }

  return (
    <div
      className={`blockNode ${selected ? "selected" : ""} ${
        isRoot ? "root" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="nodeHandle" />

      <div className="blockNodeTop">
        <span className="blockNodeType">{isRoot ? "Root" : "Node"}</span>

        {canEdit && (
          <div className="blockNodeActions">
            <button
              className="blockNodeAction"
              type="button"
              title="Add child"
              onClick={(event) => {
                event.stopPropagation();
                onAddChild?.(id);
              }}
            >
              +
            </button>

            {!isRoot && (
              <button
                className="blockNodeAction danger"
                type="button"
                title="Delete node"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(id);
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      <div className="blockNodeBody">
        {canEdit ? (
          <>
            <input
              className="blockNodeTitleInput"
              value={localTitle}
              placeholder="Untitled"
              onChange={(event) => setLocalTitle(event.target.value)}
              onBlur={saveTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            />

            <textarea
              className="blockNodeNotesInput"
              value={localNotes}
              placeholder="Add notes..."
              onChange={(event) => setLocalNotes(event.target.value)}
              onBlur={saveNotes}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            />
          </>
        ) : (
          <>
            <h3>{title || "Untitled"}</h3>

            {notes?.trim() ? (
              <p>{notes}</p>
            ) : (
              <p className="blockNodeMuted">No details yet.</p>
            )}
          </>
        )}
      </div>

      {canEdit && (
        <div className="blockNodeFooter">
          <span>Drag empty areas to organize</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="nodeHandle" />
    </div>
  );
}

export default memo(BlockNode);