export default function Sidebar({
  trees,
  activeTreeId,
  onSelectTree,
  onCreateTree,
  onAddNode,
  onRefresh,
  onExport,
  onImport,
  insights,
  saving,
  error,
}) {
  return (
    <aside className="sidebar">
      <h2>Tree Builder</h2>

      <div className="small">
        Status: {saving ? "Saving..." : "Idle"}
      </div>

      {error ? <div className="errorBox">{error}</div> : null}

      <div className="section">
        <div className="sectionTitle">Trees</div>
        <select
          value={activeTreeId || ""}
          onChange={(e) => onSelectTree(e.target.value || null)}
        >
          <option value="" disabled>Select a tree...</option>
          {trees.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <div className="row">
          <button onClick={onCreateTree}>New</button>
          <button onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <div className="section">
        <div className="sectionTitle">Actions</div>
        <button onClick={onAddNode} disabled={!activeTreeId}>Add Node</button>
        <div className="row">
          <button onClick={onExport} disabled={!activeTreeId}>Export</button>
          <button onClick={onImport}>Import</button>
        </div>
      </div>

      <div className="section">
        <div className="sectionTitle">Insights</div>
        {!insights ? (
          <div className="small muted">No insights loaded.</div>
        ) : (
          <>
            <div className="small">
              Nodes: {insights.counts?.nodes ?? 0} · Deps: {insights.counts?.deps ?? 0}
            </div>
            <div className="small">
              Blocked: {insights.counts?.blocked ?? 0} · Unblocked: {insights.counts?.unblocked ?? 0}
            </div>

            <div className="subTitle">Next actions</div>
            {Array.isArray(insights.nextActions) && insights.nextActions.length ? (
              <ul className="list">
                {insights.nextActions.map((n) => (
                  <li key={n.id}>{n.title}</li>
                ))}
              </ul>
            ) : (
              <div className="small muted">None</div>
            )}
          </>
        )}
      </div>

      <div className="footer small muted">
        Tip: drag nodes to reposition. Connect nodes by dragging from a node handle.
      </div>
    </aside>
  );
}
