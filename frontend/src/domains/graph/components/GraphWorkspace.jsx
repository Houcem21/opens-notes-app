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
            onCreateTree={!readOnly ? createTree : undefined}
            onRenameTree={!readOnly ? renameTree : undefined}
            onDeleteTree={!readOnly ? deleteTree : undefined}
          />

          <section className="graphCanvasPanel">
            {treeLoading && <LoadingScreen visible text="Loading graph" />}

            {!treeLoading && treeData && (
              <GraphCanvasBase
                readOnly={readOnly}
                treeData={treeData}
                loadGraph={() => Promise.resolve(treeData)}
                onCreateNode={(node) => orgGateApi.saveAdminNode(node)}
                onUpdateNode={(node) => orgGateApi.saveAdminNode(node)}
                onDeleteNode={(nodeId) => orgGateApi.deleteAdminNode(nodeId)}
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
    </>
  );
}