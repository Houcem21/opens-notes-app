export default function CanvasSidebar({ title, nodeCount, readOnly }) {
  return (
    <div className="sidebar">
      <div className="sideTitle">{title || "Tree"}</div>
      <div className="sideMeta">{nodeCount} nodes</div>

      <div className="sideHint">
        {readOnly ? (
          <>
            Just view.
            <br />
            Editing is only done by admin.
          </>
        ) : (
          <>
            Double-click a block to edit.
            <br />
            Drag blocks to organize the tree.
          </>
        )}
      </div>
    </div>
  );
}