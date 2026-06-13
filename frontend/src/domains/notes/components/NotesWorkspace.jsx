import { orgGateApi } from "../../../api";
import LoadingScreen from "../../../common/feedback/LoadingScreen";
import EmptyState from "../../../common/ui/EmptyState";
import NotesSidebar from "./NotesSidebar";
import TreeCanvasBase from "./TreeCanvasBase";
import { useNotesWorkspace } from "../hooks/useNotesWorkspace";

export default function NotesWorkspace({ readOnly = true }) {
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
  } = useNotesWorkspace();

  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && (
        <main className="notesWorkspace">
          <NotesSidebar
            trees={trees}
            activeTreeId={activeTreeId}
            error={error}
            readOnly={readOnly}
            onSelectTree={setActiveTreeId}
            onCreateTree={!readOnly ? createTree : undefined}
            onRenameTree={!readOnly ? renameTree : undefined}
            onDeleteTree={!readOnly ? deleteTree : undefined}
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