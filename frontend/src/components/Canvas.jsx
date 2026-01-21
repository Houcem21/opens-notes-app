import { useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function Canvas({
  backendNodes,
  backendDeps,
  onSelectNode,
  onMoveNode,
  onConnect,
  selectedNodeId,
}) {
  const rfNodes = useMemo(() => {
    return (backendNodes || []).map((n) => ({
      id: n.id,
      position: n.pos || { x: 0, y: 0 },
      data: {
        label: `${n.title}${n.status ? ` (${n.status})` : ""}`,
      },
    }));
  }, [backendNodes]);

  const rfEdges = useMemo(() => {
    return (backendDeps || []).map((d) => ({
      id: d.id,
      source: d.fromNodeId,
      target: d.toNodeId,
    }));
  }, [backendDeps]);

  const [nodes, setNodes] = useState(rfNodes);
  const [edges, setEdges] = useState(rfEdges);

  useEffect(() => setNodes(rfNodes), [rfNodes]);
  useEffect(() => setEdges(rfEdges), [rfEdges]);

  const onNodeDragStop = useCallback(
    (_, node) => {
      onMoveNode(node.id, node.position);
    },
    [onMoveNode]
  );

  const onConnectRF = useCallback(
    (conn) => {
      if (!conn.source || !conn.target) return;
      onConnect(conn.source, conn.target);
    },
    [onConnect]
  );

  return (
    <main className="canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, n) => onSelectNode(n.id)}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnectRF}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {selectedNodeId ? (
        <div className="hint">Selected: {selectedNodeId}</div>
      ) : (
        <div className="hint">Click a node to edit · Drag to move · Connect to add dependency</div>
      )}
    </main>
  );
}
