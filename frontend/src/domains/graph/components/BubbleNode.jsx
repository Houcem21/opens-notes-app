import { memo } from "react";
import { Handle, Position } from "reactflow";
import { useInlineNodeEdit } from "../hooks/useInlineNodeEdit";

function stopNodeEvent(event) {
  event.stopPropagation();
}

function BubbleNode({ id, data, selected }) {
  const {
    title,
    readOnly,
    onAddChild,
    onDelete,
    onRename,
    analysisScore= 0
  } = data;

  const canEdit = !readOnly;

  const {
    localTitle,
    setLocalTitle,
    saveTitle,
  } = useInlineNodeEdit({
    id,
    title,
    onRename,
  });

  return (
    <div
      className={`bubbleNode ${selected ? "selected" : ""}`}
      style={{
        "--analysis-score": analysisScore,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="nodeHandle"
      />

      <div className="bubbleNodeLabel">
        <input
          className="bubbleNodeTitleInput"
          value={localTitle}
          placeholder="Untitled"
          readOnly={!canEdit}
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
      </div>

      {selected && canEdit && (
        <div className="nodeFloatingMenu">
          <button type="button" onClick={() => onDelete?.(id)}>
            Delete
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="nodeHandle"
      />
    </div>
  );
}

export default memo(BubbleNode);