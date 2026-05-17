import { useEffect, useState } from "react";
import { orgGateApi } from "../../../api";
import LoadingScreen from "../../../common/components/loading/LoadingScreen";
import NotesSidebar from "./NotesSidebar";
import TreeCanvasBase from "./TreeCanvasBase";

export default function NotesWorkspace({ readOnly = true }) {
  const [trees, setTrees] = useState([]);
  const [activeTreeId, setActiveTreeId] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWorkspace() {
    try {
      setError("");
      setLoading(true);

      const data = await orgGateApi.getOrgTrees();
      const nextTrees = data.trees || [];

      setTrees(nextTrees);

      if (nextTrees.length > 0) {
        setActiveTreeId(nextTrees[0].id);
      }
    } catch (err) {
      setError(err.message || "Failed to load graphs.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTree(treeId) {
    if (!treeId) return;

    try {
      setError("");
      setTreeLoading(true);

      const data = await orgGateApi.getOrgNotes(treeId);
      setTreeData(data);
    } catch (err) {
      setError(err.message || "Failed to load graph.");
    } finally {
      setTreeLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    loadTree(activeTreeId);
  }, [activeTreeId]);

  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && (
        <main className="notesWorkspace">
          <NotesSidebar
            trees={trees}
            activeTreeId={activeTreeId}
            error={error}
            onSelectTree={setActiveTreeId}
            readOnly={readOnly}
          />

          <section className="notesCanvasPanel">
            {treeLoading && <LoadingScreen visible text="Loading graph" />}

            {!treeLoading && treeData && (
              <TreeCanvasBase
                    readOnly={readOnly}
                    treeData={treeData}
                    loadNotes={() => Promise.resolve(treeData)}
                    onCreateNode={(node) => orgGateApi.saveAdminNode(node)}
                    onUpdateNode={(node) => orgGateApi.saveAdminNode(node)}
                    onDeleteNode={(nodeId) => orgGateApi.deleteAdminNode(nodeId)}
                />
            )}

            {!treeLoading && trees.length === 0 && (
              <div className="notesEmptyState">
                <p className="notesEmptyEyebrow">No graphs yet</p>
                <h1>Start mapping your project knowledge.</h1>
                <p>Create a graph from the admin space.</p>
              </div>
            )}
          </section>
        </main>
      )}
    </>
  );
}