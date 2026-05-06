// frontend/src/components/TreeCanvas.jsx
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

import BlockNode from "./BlockNode";
import { orgGateApi } from "../../../api/orgGate";

import { NODE_TYPES, EDGE_TYPES } from "./flowTypes";

import OrgGate from "../../../common/components/OrgGate";

import "../styles/notes.css"


export default function TreeCanvas() {
  
  // The provider must wrap any component that calls useReactFlow()
  return (
    <ReactFlowProvider>
      <TreeCanvasInner />
    </ReactFlowProvider>
  );
}

function TreeCanvasInner() {
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());

  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // Build edges purely from parentId (stable and deterministic)
  useEffect(() => {
    const nextEdges = nodes
      .filter((n) => n.data?.parentId)
      .map((n) => ({
        id: `e-${n.data.parentId}-${n.id}`,
        source: n.data.parentId,
        target: n.id,
        type: "smoothstep",
      }));

    setEdges(nextEdges);
  }, [nodes, setEdges]);

  // ---- API helpers ----
  async function ensureTreeAndRoot() {
    const data = await orgGateApi.getOrgNotes();

    if (!data.tree) {
      return {
        tree: { id: null, name: "Learning" },
        nodes: [],
        dependencies: [],
      };
    }

    return {
      tree: data.tree,
      nodes: data.nodes || [],
      dependencies: data.dependencies || [],
    };
  }

  function toFlowNodes(apiNodes, treeId) {
    const rootId = apiNodes.find((node) => node.parent_id === null)?.id;

    return apiNodes.map((node) => ({
      id: node.id,
      type: "block",
      draggable: false,
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
        readOnly: true,
      },
    }));
  }

  async function refresh() {
    setLoading(true);

    try {
      const { tree: t, nodes: apiNodes } = await ensureTreeAndRoot();

      setTree(t);
      setNodes(toFlowNodes(apiNodes, t.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeOrg) return;
    refresh();
  }, [activeOrg]);



  const enrichedNodes = nodes;

  if (!activeOrg) {
    return (
      <OrgGate
        onSuccess={(organization) => {
          setActiveOrg(organization);
        }}
      />
    );
  }

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  return (
    <div className="canvasShell">
      <div className="sidebar">
        <div className="sideTitle">{tree?.name || "Tree"}</div>
        <div className="sideMeta">{enrichedNodes.length} nodes</div>
        <div className="sideHint">
          Just View
          <br />
          Editing is only done by admin.
        </div>
      </div>

      <div className="canvas">
        <div className="rf">
          <ReactFlow
            nodes={enrichedNodes}
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

