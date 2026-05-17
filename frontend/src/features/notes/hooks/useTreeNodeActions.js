import { useCallback } from "react";

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

      const savedNode = saved.node || saved;

      setNodes((current) => [
        ...current,
        {
          id: savedNode.id,
          type: "block",
          draggable: true,
          position,
          data: {
            title: savedNode.title,
            notes: savedNode.notes || "",
            isRoot: false,
            treeId: saved.tree?.id || tree?.id,
            parentId,
            readOnly,
          },
        },
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

      const saved = await onUpdateNode({
        id: nodeId,
        title,
        notes: currentNode?.data?.notes || "",
        parentId: currentNode?.data?.parentId ?? null,
        pos: currentNode?.position || { x: 0, y: 0 },
      });

      const savedNode = saved.node || saved;

      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  title: savedNode.title || title,
                },
              }
            : node
        )
      );
    },
    [readOnly, onUpdateNode, nodesRef, setNodes]
  );

  const moveNode = useCallback(
    async (_event, draggedNode) => {
      if (readOnly || typeof onUpdateNode !== "function") return;

      const intersections = getIntersectingNodes(draggedNode).filter(
        (node) =>
          node.id !== draggedNode.id &&
          !node.data?.isRoot
      );

      const target = intersections[0] || null;

      const parentId = target
        ? target.id
        : draggedNode.data?.parentId ?? null;

      const saved = await onUpdateNode({
        id: draggedNode.id,
        title: draggedNode.data?.title || "Untitled",
        notes: draggedNode.data?.notes || "",
        parentId,
        pos: draggedNode.position,
      });

      const savedNode = saved.node || saved;

      setNodes((current) =>
        current.map((node) =>
          node.id === draggedNode.id
            ? {
                ...node,
                position: draggedNode.position,
                data: {
                  ...node.data,
                  title: savedNode.title || node.data.title,
                  notes: savedNode.notes || node.data.notes,
                  parentId,
                },
              }
            : node
        )
      );
    },
    [readOnly, onUpdateNode, getIntersectingNodes, setNodes]
  );

  const saveNodeDetails = useCallback(
    async ({ node, title, notes }) => {
      if (readOnly || !node || typeof onUpdateNode !== "function") return;

      const saved = await onUpdateNode({
        id: node.id,
        title,
        notes,
        parentId: node.data?.parentId ?? null,
        pos: node.position || { x: 0, y: 0 },
      });

      const savedNode = saved.node || saved;

      setNodes((current) =>
        current.map((item) =>
          item.id === node.id
            ? {
                ...item,
                data: {
                  ...item.data,
                  title: savedNode.title || title,
                  notes: savedNode.notes || notes,
                },
              }
            : item
        )
      );
    },
    [readOnly, onUpdateNode, setNodes]
  );

  return {
    addChild,
    deleteNode,
    renameNode,
    moveNode,
    saveNodeDetails,
  };
}