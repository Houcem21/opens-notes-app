import ErrorMessage from "../../../common/components/ErrorMessage";

export default function NotesSidebar({
  trees,
  activeTreeId,
  error,
  onSelectTree,
  readOnly = true,
}) {
  return (
    <aside className="notesSidebar">
        <div className="notesSidebarHeader">
            <p className="notesEyebrow">Knowledge Graphs</p>
            <h1>Project Maps</h1>
        </div>
        <p className="notesSidebarMode">
        {readOnly ? "View mode" : "Admin edit mode"}
        </p>
        <ErrorMessage message={error} />

        <div className="notesGraphList">
            {trees.map((tree) => (
            <button
                key={tree.id}
                className={`notesGraphItem ${
                tree.id === activeTreeId ? "active" : ""
                }`}
                onClick={() => onSelectTree(tree.id)}
            >
                <strong>{tree.name}</strong>
                <span>Graph</span>
            </button>
            ))}
        </div>
    </aside>
  );
}