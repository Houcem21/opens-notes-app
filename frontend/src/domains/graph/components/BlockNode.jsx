import { memo } from "react";
import { Handle, Position } from "reactflow";
import { useInlineNodeEdit } from "../hooks/useInlineNodeEdit";

function stopNodeEvent(event) {
  event.stopPropagation();
}

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

  const {
    localTitle,
    localNotes,
    setLocalTitle,
    setLocalNotes,
    saveTitle,
    saveNotes,
  } = useInlineNodeEdit({
    id,
    title,
    notes,
    onRename,
    onUpdateNotes,
  });

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
              onPointerDown={stopNodeEvent}
              onClick={stopNodeEvent}
            />

            <textarea
              className="blockNodeNotesInput"
              value={localNotes}
              placeholder="Add notes..."
              onChange={(event) => setLocalNotes(event.target.value)}
              onBlur={saveNotes}
              onPointerDown={stopNodeEvent}
              onClick={stopNodeEvent}
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