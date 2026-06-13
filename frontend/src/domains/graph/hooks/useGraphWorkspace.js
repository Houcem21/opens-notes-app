import { useEffect, useState } from "react";
import { orgGateApi } from "../../../api";

export function useGraphWorkspace() {
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
      setActiveTreeId(nextTrees[0]?.id || null);
    } catch (err) {
      setError(err.message || "Failed to load graphs.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTree(treeId) {
    if (!treeId) {
      setTreeData(null);
      return;
    }

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

      setTrees((current) => {
        const remainingTrees = current.filter((item) => item.id !== tree.id);

        if (activeTreeId === tree.id) {
          setActiveTreeId(remainingTrees[0]?.id || null);
          setTreeData(null);
        }

        return remainingTrees;
      });
    } catch (err) {
      setError(err.message || "Failed to delete graph.");
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    loadTree(activeTreeId);
  }, [activeTreeId]);

  return {
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
  };
}