import { useEffect, useMemo, useState } from "react";
import { orgGateApi } from "../../../../api";

export default function ReferencePickerModal({ onClose, onSelect }) {
  const [referenceType, setReferenceType] = useState("graph");
  const [graphs, setGraphs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReferences() {
      try {
        setError("");
        setLoading(true);

        const [graphData, taskData] = await Promise.all([
          orgGateApi.getOrgTrees(),
          orgGateApi.getOrgTasks(),
        ]);

        setGraphs(graphData.trees || []);
        setTasks(taskData.tasks || taskData || []);
      } catch (err) {
        setError(err.message || "Failed to load references.");
      } finally {
        setLoading(false);
      }
    }

    loadReferences();
  }, []);

  const items = useMemo(() => {
    return referenceType === "graph" ? graphs : tasks;
  }, [referenceType, graphs, tasks]);

  function getItemLabel(item) {
    return item.name || item.title || "Untitled";
  }

  function handleSelect(item) {
    onSelect({
      type: referenceType,
      id: item.id,
      label: getItemLabel(item),
    });
  }

  return (
    <div className="graphModalOverlay" onClick={onClose}>
      <section
        className="graphModalPanel referencePickerPanel"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="graphModalClose" type="button" onClick={onClose}>
          ×
        </button>

        <p className="graphEyebrow">Reference</p>
        <h2>Insert reference</h2>

        <label className="graphModalField">
          <span>Reference type</span>
          <select
            value={referenceType}
            onChange={(event) => setReferenceType(event.target.value)}
          >
            <option value="graph">Graph</option>
            <option value="task">Task</option>
          </select>
        </label>

        {loading && <p className="mutedText">Loading references...</p>}

        {error && <p className="dangerText">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="mutedText">No {referenceType}s found.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="referencePickerList">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="referencePickerItem"
                onClick={() => handleSelect(item)}
              >
                <strong>{getItemLabel(item)}</strong>
                <span>{referenceType}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}