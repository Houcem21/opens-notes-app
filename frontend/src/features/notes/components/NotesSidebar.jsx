import ErrorMessage from "../../../common/components/ErrorMessage";
import { Link } from "react-router-dom";

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
      <div className="notesSidebarHeader">
        <div>
          <p className="notesEyebrow">Knowledge Graphs</p>
          <h1>Project Maps</h1>
          <p className="notesSidebarMode">
            {readOnly ? "View mode" : "Admin edit mode"}
          </p>
        </div>

        {!readOnly && (
          <div> 
            <button className="btn" type="button" onClick={onCreateTree}>
              + Graph
            </button>

            <Link className="btn btnSecondary" to="/admin/notes/import">
              Import Repo
            </Link>
          </div>
        )}
      </div>

      <ErrorMessage message={error} />

      <div className="notesGraphList">
        {trees.length === 0 ? (
          <p className="mutedText">No graphs yet.</p>
        ) : (
          trees.map((tree) => (
            <button
              key={tree.id}
              className={`notesGraphItem ${
                tree.id === activeTreeId ? "active" : ""
              }`}
              onClick={() => onSelectTree(tree.id)}
            >
              <span className="notesGraphContent">
                <strong>{tree.name}</strong>
                <small>Graph</small>
              </span>

              {!readOnly && (
                <span className="notesGraphActions">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRenameTree(tree);
                    }}
                  >
                    Rename
                  </span>

                  <span
                    role="button"
                    tabIndex={0}
                    className="dangerText"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteTree(tree);
                    }}
                  >
                    Delete
                  </span>
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}