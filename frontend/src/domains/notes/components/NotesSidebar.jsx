import { Link } from "react-router-dom";
import ErrorMessage from "../../../common/feedback/ErrorMessage";

export default function NotesSidebar({
  trees,
  activeTreeId,
  error,
  readOnly = true,
  onSelectTree,
  onCreateTree,
  onRenameTree,
  onDeleteTree,
}) {
  return (
    <aside className="notesSidebar">
      <SidebarHeader readOnly={readOnly} onCreateTree={onCreateTree} />

      <ErrorMessage message={error} />

      <GraphList
        trees={trees}
        activeTreeId={activeTreeId}
        readOnly={readOnly}
        onSelectTree={onSelectTree}
        onRenameTree={onRenameTree}
        onDeleteTree={onDeleteTree}
      />
    </aside>
  );
}

function SidebarHeader({ readOnly, onCreateTree }) {
  return (
    <div className="notesSidebarHeader">
      <div>
        <p className="notesEyebrow">Knowledge Graphs</p>
        <h1>Project Maps</h1>
        <p className="notesSidebarMode">
          {readOnly ? "View mode" : "Admin edit mode"}
        </p>
      </div>

      {!readOnly && (
        <div className="notesSidebarActions">
          <button className="btn" type="button" onClick={onCreateTree}>
            + Graph
          </button>

          <Link className="btn btnSecondary" to="/admin/notes/import">
            Import Repo
          </Link>
        </div>
      )}
    </div>
  );
}

function GraphList({
  trees,
  activeTreeId,
  readOnly,
  onSelectTree,
  onRenameTree,
  onDeleteTree,
}) {
  if (trees.length === 0) {
    return (
      <div className="notesGraphList">
        <p className="mutedText">No graphs yet.</p>
      </div>
    );
  }

  return (
    <div className="notesGraphList">
      {trees.map((tree) => (
        <GraphListItem
          key={tree.id}
          tree={tree}
          active={tree.id === activeTreeId}
          readOnly={readOnly}
          onSelectTree={onSelectTree}
          onRenameTree={onRenameTree}
          onDeleteTree={onDeleteTree}
        />
      ))}
    </div>
  );
}

function GraphListItem({
  tree,
  active,
  readOnly,
  onSelectTree,
  onRenameTree,
  onDeleteTree,
}) {
  return (
    <button
      className={`notesGraphItem ${active ? "active" : ""}`}
      onClick={() => onSelectTree(tree.id)}
    >
      <span className="notesGraphContent">
        <strong>{tree.name}</strong>
        <small>Graph</small>
      </span>

      {!readOnly && (
        <span className="notesGraphActions">
          <GraphAction onClick={() => onRenameTree(tree)}>Rename</GraphAction>

          <GraphAction danger onClick={() => onDeleteTree(tree)}>
            Delete
          </GraphAction>
        </span>
      )}
    </button>
  );
}

function GraphAction({ children, danger = false, onClick }) {
  return (
    <span
      role="button"
      tabIndex={0}
      className={danger ? "dangerText" : ""}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }
      }}
    >
      {children}
    </span>
  );
}