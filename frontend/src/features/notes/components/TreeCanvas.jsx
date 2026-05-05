// frontend/src/components/TreeCanvas.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

import NodeEditorModal from "./NodeEditorModal";
import BlockNode from "./BlockNode";
import { orgGateApi } from "../../../api/orgGate";

import { NODE_TYPES, EDGE_TYPES } from "./flowTypes";

import OrgGate from "../../../common/components/OrgGate";

import "../styles/notes.css"

function rectOfNode(n) {
    const w = n.width || 180;
    const h = n.height || 90;
    return { x: n.position.x, y: n.position.y, w, h };
}

function overlaps(a, b) {
return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
);
}

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

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);

  const activeNode = useMemo(
    () => nodes.find((n) => n.id === activeNodeId) || null,
    [nodes, activeNodeId]
  );

  // Now this is safe because we're inside ReactFlowProvider
  const { getIntersectingNodes } = useReactFlow();

  const nodesRef = useRef([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

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
        tree: { id: null, name: "No notes yet" },
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
    const rootId = apiNodes.find((n) => n.parentId === null)?.id;

    return apiNodes.map((n) => ({
      id: n.id,
      type: "block",
      position:
        n.pos && typeof n.pos.x === "number" ? n.pos : { x: 0, y: 0 },
      data: {
        title: n.title,
        notes: n.notes || "",
        isRoot: n.id === rootId,
        treeId,
        parentId: n.parentId,
        readOnly: true,
      },
    }));
  }

  async function refresh() {
    setLoading(true);
    try {
      const { tree: t, nodes: apiNodes, dependencies } = await ensureTreeAndRoot();
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

  // ---- Node actions ----
  const onAddChild = useCallback(
    async (parentId) => {
      if (!tree) return;

      const parent = nodesRef.current.find((n) => n.id === parentId);
      const baseX = parent?.position?.x ?? 0;
      const baseY = parent?.position?.y ?? 0;

      const created = await notesApi.createNode({
        treeId: tree.id,
        parentId,
        title: "New",
      });

      const newPos = { x: baseX + 240, y: baseY + 120 };
      await notesApi.updateNode(created.id, { pos: newPos });

      setNodes((prev) => [
        ...prev,
        {
          id: created.id,
          type: "block",
          position: newPos,
          data: {
            title: created.title,
            notes: created.notes || "",
            isRoot: false,
            treeId: tree.id,
            parentId, // ✅ keep parentId in node.data
          },
        },
      ]);
    },
    [setNodes, tree]
  );
  const onNodeDoubleClick = useCallback((evt, node) => {
    evt.preventDefault();
    evt.stopPropagation();
    setActiveNodeId(node.id);
    setEditorOpen(true);
  }, []);

  const saveNodeDetails = useCallback(
    async ({ title, notes }) => {
      if (!activeNodeId) return;

      // persist to backend
      await notesApi.updateNode(activeNodeId, { title, notes });

      // update UI state
      setNodes((prev) =>
        prev.map((n) =>
          n.id === activeNodeId
            ? { ...n, data: { ...n.data, title, notes } }
            : n
        )
      );

      setEditorOpen(false);
    },
    [activeNodeId, setNodes]
  );

  const onDelete = useCallback(
    async (id) => {
      if (!tree) return;
      if (!confirm("Delete this node? (children may become orphaned)")) return;

      await notesApi.deleteNode(id);

      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges, tree]
  );

  const onRename = useCallback(
    async (id, title) => {
      await notesApi.updateNode(id, { title });

      setNodes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, title } } : n
        )
      );
    },
    [setNodes]
  );

  const enrichedNodes = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onAddChild,
        onDelete,
        onRename,
      },
    }));
  }, [nodes, onAddChild, onDelete, onRename]);

  // ---- Drag stop: persist pos, re-parent ONLY if actually dropped onto a node ----
  const onNodeDragStop = useCallback(
    async (evt, dragged) => {
      await notesApi.updateNode(dragged.id, { pos: dragged.position });

      const intersections = getIntersectingNodes(dragged).filter(
        (n) => n.id !== dragged.id
      );

      const target = intersections[0] || null;

      // ✅ Important: do NOT unparent if no target
      if (!target) return;

      const newParentId = target.id;

      await notesApi.updateNode(dragged.id, { parentId: newParentId });

      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragged.id
            ? { ...n, data: { ...n.data, parentId: newParentId } }
            : n
        )
      );
    },
    [getIntersectingNodes, setNodes]
  );

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
          Double-click a block to rename.
          <br />
          Drag a block onto another block to make it a child.
        </div>
      </div>

      <div className="canvas">
        <div className="rf">
          <ReactFlow
            nodes={enrichedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            onNodeDoubleClick={onNodeDoubleClick}
          >
            <Background />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>

      <NodeEditorModal
        open={editorOpen}
        node={activeNode}
        onClose={() => setEditorOpen(false)}
        onSave={saveNodeDetails}
      />

    </div>
  );
}

