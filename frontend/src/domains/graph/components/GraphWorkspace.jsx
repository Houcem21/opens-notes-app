import { useState } from "react";

import { orgGateApi } from "../../../api";
import LoadingScreen from "../../../common/feedback/LoadingScreen";
import EmptyState from "../../../common/ui/EmptyState";
import GraphSidebar from "./GraphSidebar";
import GraphCanvasBase from "./GraphCanvasBase";
import { useGraphWorkspace } from "../hooks/useGraphWorkspace";


export default function GraphWorkspace({ readOnly = true }) {
  const {
    trees,
    activeTreeId,
    treeData,
    loading,
    treeLoading,
    error,
    setActiveTreeId,
    createTree,
    renameTree,
    deleteTree,
  } = useGraphWorkspace();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && (
        <main className="graphWorkspace">
          <GraphSidebar
            trees={trees}
            activeTreeId={activeTreeId}
            error={error}
            readOnly={readOnly}
            onSelectTree={setActiveTreeId}
            onCreateTree={!readOnly ? () => setCreateModalOpen(true) : undefined}
            onRenameTree={!readOnly ? renameTree : undefined}
            onDeleteTree={!readOnly ? deleteTree : undefined}
          />

          <section className="graphCanvasPanel">
            {treeLoading && <LoadingScreen visible text="Loading graph" />}

            {!treeLoading && treeData && (
              <GraphCanvasBase
                readOnly={readOnly}
                treeData={treeData}
                mode={treeData?.graph?.graph_type === "tree" || treeData?.tree?.graph_type === "tree" ? "tree" : "graph"}
                loadGraph={() => Promise.resolve(treeData)}
                onCreateNode={(node) => orgGateApi.saveAdminNode(node)}
                onUpdateNode={(node) => orgGateApi.saveAdminNode(node)}
                onDeleteNode={(nodeId) => orgGateApi.deleteAdminNode(nodeId)}
                onCreateEdge={(edge) => orgGateApi.saveAdminEdge(edge)}
                onDeleteEdge={(edgeId) => orgGateApi.deleteAdminEdge(edgeId)}
              />
            )}

            {!treeLoading && trees.length === 0 && (
              <EmptyState
                eyebrow="Knowledge Graphs"
                title="No graphs yet"
                description="Create your first project graph from the admin workspace."
              />
            )}
          </section>
        </main>
      )}
      {createModalOpen && (
        <CreateGraphModal
          onClose={() => setCreateModalOpen(false)}
          onCreate={async (draft) => {
            await createTree(draft);
            setCreateModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function CreateGraphModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [graphType, setGraphType] = useState("general");

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreate({ name, graphType });
  }

  return (
    <div className="graphModalOverlay" onClick={onClose}>
      <form
        className="graphModalPanel"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button className="graphModalClose" type="button" onClick={onClose}>
          ×
        </button>

        <p className="graphEyebrow">New Graph</p>
        <h2>Create project map</h2>

        <label className="graphModalField">
          <span>Name</span>
          <input
            value={name}
            autoFocus
            placeholder="Example: Sweets"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="graphModalField">
          <span>Type</span>
          <select
            value={graphType}
            onChange={(event) => setGraphType(event.target.value)}
          >
            <option value="general">General graph</option>
            <option value="tree">Tree graph</option>
          </select>
        </label>

        <div className="graphModalActions">
          <button className="btn btnSecondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}