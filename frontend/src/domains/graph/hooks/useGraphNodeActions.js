import { useCallback } from "react";
import { addEdge } from "reactflow";
import {
  createChildFlowNode,
  createNodeUpdatePayload,
  getSavedNode,
  updateFlowNode,
} from "../utils/nodeActions";

export function useGraphNodeActions({
  readOnly,
  graph,
  mode,
  nodesRef,
  setNodes,
  setEdges,
  getIntersectingNodes,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onCreateEdge,
  onDeleteEdge
}) {

  const addRootNode = useCallback(
    async () => {
      if (readOnly || mode !== "graph" || typeof onCreateNode !== "function") return;

      const position = {
        x: 80 + nodesRef.current.length * 40,
        y: 80 + nodesRef.current.length * 40,
      };

      const saved = await onCreateNode({
        treeId: graph?.id,
        parentId: null,
        title: "New",
        details: "",
        nodeType: "bubble",
        pos: position,
      });

      const savedNode = getSavedNode(saved);

      setNodes((current) => [
        ...current,
        createChildFlowNode({
          savedNode,
          treeId: saved?.graph?.id || saved?.tree?.id || graph?.id,
          parentId: null,
          position,
          readOnly,
          nodeType: "bubble",
        }),
      ]);
    },
    [readOnly, mode, onCreateNode, nodesRef, setNodes, graph?.id]
  );

  const addChild = useCallback(
    async (parentId, nodeType = mode === "tree" ? "block" : "bubble") => {
      if (readOnly || typeof onCreateNode !== "function") return;

      const parent = nodesRef.current.find((node) => node.id === parentId);
      const position = {
        x: (parent?.position?.x ?? 0) + 240,
        y: (parent?.position?.y ?? 0) + 120,
      };

      const saved = await onCreateNode({
        treeId: graph?.id,
        parentId,
        nodeType,
        title: "New",
        details: "",
        pos: position,
      });

      const savedNode = getSavedNode(saved);
      const childNode = createChildFlowNode({
        savedNode,
        treeId: saved?.graph?.id || saved?.tree?.id || graph?.id,
        parentId,
        position,
        readOnly,
        nodeType,
      });

      setNodes((current) => [...current, childNode]);

      if (mode === "tree") {
        const savedEdge = await onCreateEdge?.({
          treeId: graph?.id,
          sourceNodeId: parentId,
          targetNodeId: savedNode.id,
          type: "smoothstep",
        });

        const edge = savedEdge?.edge || savedEdge;

        if (edge?.id) {
          setEdges((current) =>
            addEdge(
              {
                id: edge.id,
                source: edge.from_node_id,
                target: edge.to_node_id,
                type: "smoothstep",
                data: {},
              },
              current
            )
          );
        }
      }
    },
    [readOnly, onCreateNode, nodesRef, setNodes, graph?.id, onCreateEdge, mode]
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
            details: savedNode.details || node.data.details,
            parentId,
          },
        }))
      );
    },
    [readOnly, onUpdateNode, getIntersectingNodes, setNodes]
  );

  const updateDetails = useCallback(
    async (nodeId, details) => {
      if (readOnly || typeof onUpdateNode !== "function") return;

      const currentNode = nodesRef.current.find((node) => node.id === nodeId);
      if (!currentNode) return;

      const saved = await onUpdateNode(
        createNodeUpdatePayload(currentNode, { details })
      );

      const savedNode = getSavedNode(saved);

      setNodes((current) =>
        updateFlowNode(current, nodeId, (node) => ({
          ...node,
          data: {
            ...node.data,
            details: savedNode.details || details,
          },
        }))
      );
    },
    [readOnly, onUpdateNode, nodesRef, setNodes]
  );

  const connectNodes = useCallback(
    async (connection) => {
      if (readOnly || typeof onCreateEdge !== "function") return;

      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;
      const flowEdgeType = mode === "tree" ? "smoothstep" : "straight";
      try {
        const saved = await onCreateEdge({
          treeId: graph?.id,
          sourceNodeId: connection.source,
          targetNodeId: connection.target,
          label: "",
          type: flowEdgeType,
        });

        const savedEdge = saved?.edge || saved;

        setEdges((current) =>
          addEdge(
            {
              id: savedEdge.id,
              source: savedEdge.from_node_id,
              target: savedEdge.to_node_id,
              type: flowEdgeType,
              data: {},
            },
            current
          )
        );
      } catch (err) {
        console.error("Failed to create edge:", err);
        alert(err.message || "Failed to create edge");
      }
    },
    [readOnly, onCreateEdge, graph?.id, setEdges, mode]
  );

  return {
    addChild,
    addRootNode,
    deleteNode,
    renameNode,
    moveNode,
    updateDetails,
    connectNodes
  };
}