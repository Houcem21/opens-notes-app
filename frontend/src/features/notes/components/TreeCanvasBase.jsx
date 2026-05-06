import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";

import { NODE_TYPES, EDGE_TYPES } from "./flowTypes";
import "../styles/notes.css";

export default function TreeCanvasBase({
  loadNotes,
  readOnly = true,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
}) {
  return (
    <ReactFlowProvider>
      <TreeCanvasBaseInner
        loadNotes={loadNotes}
        readOnly={readOnly}
        onCreateNode={onCreateNode}
        onUpdateNode={onUpdateNode}
        onDeleteNode={onDeleteNode}
      />
    </ReactFlowProvider>
  );
}

function TreeCanvasBaseInner({ loadNotes, readOnly, onCreateNode, onUpdateNode, onDeleteNode, }) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    const nextEdges = nodes
      .filter((node) => node.data?.parentId)
      .map((node) => ({
        id: `e-${node.data.parentId}-${node.id}`,
        source: node.data.parentId,
        target: node.id,
        type: "smoothstep",
      }));

    setEdges(nextEdges);
  }, [nodes, setEdges]);

  function toFlowNodes(apiNodes, treeId) {
    const rootId = apiNodes.find((node) => node.parent_id === null)?.id;

    return apiNodes.map((node) => ({
      id: node.id,
      type: "block",
      draggable: !readOnly,
      position: {
        x: Number(node.pos_x || 0),
        y: Number(node.pos_y || 0),
      },
      data: {
        title: node.title,
        notes: node.notes || "",
        isRoot: node.id === rootId,
        treeId,
        parentId: node.parent_id,
        readOnly,
      },
    }));
  }

  async function refresh() {
    setLoading(true);

    try {
      const data = await loadNotes();

      const nextTree = data.tree || { id: null, name: "Learning" };
      const nextNodes = data.nodes || [];

      setTree(nextTree);
      setNodes(toFlowNodes(nextNodes, nextTree.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadNotes]);

  const flowNodes = useMemo(() => nodes, [nodes]);

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  return (
    <div className="canvasShell">
      <div className="sidebar">
        <div className="sideTitle">{tree?.name || "Tree"}</div>
        <div className="sideMeta">{flowNodes.length} nodes</div>
        <div className="sideHint">
          {readOnly ? (
            <>
              Just view.
              <br />
              Editing is only done by admin.
            </>
          ) : (
            <>
              Double-click a block to edit.
              <br />
              Drag blocks to organize the tree.
            </>
          )}
        </div>
      </div>

      <div className="canvas">
        <div className="rf">
          <ReactFlow
            nodes={flowNodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
          >
            <Background />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}