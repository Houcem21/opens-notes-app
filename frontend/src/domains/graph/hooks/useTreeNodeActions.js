import { useCallback } from "react";
import {
  createChildFlowNode,
  createNodeUpdatePayload,
  getSavedNode,
  updateFlowNode,
} from "../utils/nodeActions";

export function useTreeNodeActions({
  readOnly,
  tree,
  nodesRef,
  setNodes,
  setEdges,
  getIntersectingNodes,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
}) {
  const addChild = useCallback(
    async (parentId) => {
      if (readOnly || typeof onCreateNode !== "function") return;

      const parent = nodesRef.current.find((node) => node.id === parentId);
      const position = {
        x: (parent?.position?.x ?? 0) + 240,
        y: (parent?.position?.y ?? 0) + 120,
      };

      const saved = await onCreateNode({
        parentId,
        title: "New",
        notes: "",
        pos: position,
      });

      const savedNode = getSavedNode(saved);

      setNodes((current) => [
        ...current,
        createChildFlowNode({
          savedNode,
          treeId: saved?.tree?.id || tree?.id,
          parentId,
          position,
          readOnly,
        }),
      ]);
    },
    [readOnly, onCreateNode, nodesRef, setNodes, tree?.id]
  );

  const deleteNode = useCallback(
    async (nodeId) => {
      if (readOnly || typeof onDeleteNode !== "function") return;
      if (!confirm("Delete this node?")) return;

      await onDeleteNode(nodeId);

      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) =>
        current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [readOnly, onDeleteNode, setNodes, setEdges]
  );

  const renameNode = useCallback(
    async (nodeId, title) => {
      if (readOnly || typeof onUpdateNode !== "function") return;

      const currentNode = nodesRef.current.find((node) => node.id === nodeId);
      if (!currentNode) return;

      const saved = await onUpdateNode(
        createNodeUpdatePayload(currentNode, { title })
      );

      const savedNode = getSavedNode(saved);

      setNodes((current) =>
        updateFlowNode(current, nodeId, (node) => ({
          ...node,
          data: {
            ...node.data,
            title: savedNode.title || title,
          },
        }))
      );
    },
    [readOnly, onUpdateNode, nodesRef, setNodes]
  );

  const moveNode = useCallback(
    async (_event, draggedNode) => {
      if (readOnly || typeof onUpdateNode !== "function") return;

      const target = getIntersectingNodes(draggedNode).find(
        (node) => node.id !== draggedNode.id && !node.data?.isRoot
      );

      const parentId = target ? target.id : draggedNode.data?.parentId ?? null;

      const saved = await onUpdateNode(
        createNodeUpdatePayload(draggedNode, {
          parentId,
          pos: draggedNode.position,
        })
      );

      const savedNode = getSavedNode(saved);

      setNodes((current) =>
        updateFlowNode(current, draggedNode.id, (node) => ({
          ...node,
          position: draggedNode.position,
          data: {
            ...node.data,
            title: savedNode.title || node.data.title,
            notes: savedNode.notes || node.data.notes,
            parentId,
          },
        }))
      );
    },
    [readOnly, onUpdateNode, getIntersectingNodes, setNodes]
  );

  const updateNotes = useCallback(
    async (nodeId, notes) => {
      if (readOnly || typeof onUpdateNode !== "function") return;

      const currentNode = nodesRef.current.find((node) => node.id === nodeId);
      if (!currentNode) return;

      const saved = await onUpdateNode(
        createNodeUpdatePayload(currentNode, { notes })
      );

      const savedNode = getSavedNode(saved);

      setNodes((current) =>
        updateFlowNode(current, nodeId, (node) => ({
          ...node,
          data: {
            ...node.data,
            notes: savedNode.notes || notes,
          },
        }))
      );
    },
    [readOnly, onUpdateNode, nodesRef, setNodes]
  );

  return {
    addChild,
    deleteNode,
    renameNode,
    moveNode,
    updateNotes,
  };
}