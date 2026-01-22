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
import { apiFetch } from "../api/client";

import { NODE_TYPES, EDGE_TYPES } from "./flowTypes";

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

  // ✅ Now this is safe because we're inside ReactFlowProvider
  const { getIntersectingNodes } = useReactFlow();

  const nodesRef = useRef([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // ✅ Build edges purely from parentId (stable and deterministic)
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
    const trees = await apiFetch("/trees");
    let t = trees?.[0];

    if (!t) {
      t = await apiFetch("/trees", {
        method: "POST",
        body: JSON.stringify({ name: "Learning" }),
      });
    }

    const ns = await apiFetch(`/trees/${t.id}/nodes`);

    if (!Array.isArray(ns) || ns.length === 0) {
      const root = await apiFetch("/nodes", {
        method: "POST",
        body: JSON.stringify({
          treeId: t.id,
          parentId: null,
          title: t.name || "Root",
        }),
      });
      return { tree: t, nodes: [root] };
    }

    return { tree: t, nodes: ns };
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
        parentId: n.parentId, // ✅ keep for edges
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
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Node actions ----
  const onAddChild = useCallback(
    async (parentId) => {
      if (!tree) return;

      const parent = nodesRef.current.find((n) => n.id === parentId);
      const baseX = parent?.position?.x ?? 0;
      const baseY = parent?.position?.y ?? 0;

      const created = await apiFetch("/nodes", {
        method: "POST",
        body: JSON.stringify({
          treeId: tree.id,
          parentId,
          title: "New",
        }),
      });

      const newPos = { x: baseX + 240, y: baseY + 120 };
      await apiFetch(`/nodes/${created.id}`, {
        method: "PATCH",
        body: JSON.stringify({ pos: newPos }),
      });

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
      await apiFetch(`/nodes/${activeNodeId}`, {
        method: "PATCH",
        body: JSON.stringify({ title, notes }),
      });

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

      await apiFetch(`/nodes/${id}`, { method: "DELETE" });

      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges, tree]
  );

  const onRename = useCallback(
    async (id, title) => {
      await apiFetch(`/nodes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });

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
      await apiFetch(`/nodes/${dragged.id}`, {
        method: "PATCH",
        body: JSON.stringify({ pos: dragged.position }),
      });

      const intersections = getIntersectingNodes(dragged).filter(
        (n) => n.id !== dragged.id
      );

      const target = intersections[0] || null;

      // ✅ Important: do NOT unparent if no target
      if (!target) return;

      const newParentId = target.id;

      await apiFetch(`/nodes/${dragged.id}`, {
        method: "PATCH",
        body: JSON.stringify({ parentId: newParentId }),
      });

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

