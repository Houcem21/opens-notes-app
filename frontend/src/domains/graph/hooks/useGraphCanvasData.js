import { useEffect, useRef, useState } from "react";
import { useEdgesState, useNodesState } from "reactflow";
import { toFlowEdges, toFlowNodes } from "../utils/graphFlowMapping";

export function useGraphCanvasData({ loadGraph, readOnly, mode="graph" }) {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodesRef = useRef([]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    async function refreshGraph() {
      setLoading(true);

      try {
        const data = await loadGraph();
        const nextGraph = data.graph || data.tree || { id: null, name: "Learning" };
        const nextNodes = data.nodes || [];
        const nextEdges = data.dependencies || data.edges || [];

        setGraph(nextGraph);
        setNodes(toFlowNodes(nextNodes, nextGraph.id, readOnly));
        setEdges(toFlowEdges(nextEdges, mode));
      } finally {
        setLoading(false);
      }
    }

    refreshGraph();
  }, [loadGraph, readOnly, setNodes]);

  return {
    graph,
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