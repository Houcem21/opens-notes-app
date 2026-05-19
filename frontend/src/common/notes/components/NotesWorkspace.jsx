import { useEffect, useState } from "react";
import { orgGateApi } from "../../../api";
import LoadingScreen from "../../components/loading/LoadingScreen";
import NotesSidebar from "./NotesSidebar";
import TreeCanvasBase from "./TreeCanvasBase";

import EmptyState from "../../ui/EmptyState";

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
    async function createTree() {
        const name = prompt("Graph name?");
        if (!name?.trim()) return;

        try {
            setError("");

            const data = await orgGateApi.saveAdminTree({
            name: name.trim(),
            });

            const nextTree = data.tree;

            setTrees((current) => [...current, nextTree]);
            setActiveTreeId(nextTree.id);
        } catch (err) {
            setError(err.message || "Failed to create graph.");
        }
    }

    async function renameTree(tree) {
        const name = prompt("New graph name?", tree.name);
        if (!name?.trim()) return;

        try {
            setError("");

            const data = await orgGateApi.saveAdminTree({
            id: tree.id,
            name: name.trim(),
            });

            setTrees((current) =>
            current.map((item) => (item.id === tree.id ? data.tree : item))
            );
        } catch (err) {
            setError(err.message || "Failed to rename graph.");
        }
    }

    async function deleteTree(tree) {
        if (!confirm(`Delete "${tree.name}"?`)) return;

        try {
            setError("");

            await orgGateApi.deleteAdminTree(tree.id);

            const remainingTrees = trees.filter((item) => item.id !== tree.id);
            setTrees(remainingTrees);

            if (activeTreeId === tree.id) {
            setActiveTreeId(remainingTrees[0]?.id || null);
            setTreeData(null);
            }
        } catch (err) {
            setError(err.message || "Failed to delete graph.");
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