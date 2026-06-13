import { useEffect, useRef, useState } from "react";
import { useEdgesState, useNodesState } from "reactflow";
import { toFlowEdges, toFlowNodes } from "../utils/treeFlowMapping";

export function useTreeCanvasData({ loadGraph, readOnly }) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodesRef = useRef([]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    setEdges(toFlowEdges(nodes));
  }, [nodes, setEdges]);

  useEffect(() => {
    async function refreshTree() {
      setLoading(true);

      try {
        const data = await loadGraph();
        const nextTree = data.tree || { id: null, name: "Learning" };
        const nextNodes = data.nodes || [];

        setTree(nextTree);
        setNodes(toFlowNodes(nextNodes, nextTree.id, readOnly));
      } finally {
        setLoading(false);
      }
    }

    refreshTree();
  }, [loadGraph, readOnly, setNodes]);

  return {
    tree,
    loading,
    nodes,
    edges,
    setNodes,
    setEdges,
    nodesRef,
    onNodesChange,
    onEdgesChange,
  };
}