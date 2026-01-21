// frontend/src/components/TreeCanvas.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useEdgesState,
    useNodesState,
    useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";

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
const [tree, setTree] = useState(null);
const [loading, setLoading] = useState(true);

const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]); // we’re not drawing edges yet

const nodesRef = useRef([]);
useEffect(() => {
    nodesRef.current = nodes;
}, [nodes]);

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
    // 1) load trees
    const trees = await apiFetch("/trees");
    let t = trees?.[0];

    // 2) if none exists, create one
    if (!t) {
    t = await apiFetch("/trees", {
        method: "POST",
        body: JSON.stringify({ name: "Learning" }),
    });
    }

    // 3) load nodes
    const ns = await apiFetch(`/trees/${t.id}/nodes`);

    // 4) if no nodes, create root node
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
    position: n.pos && typeof n.pos.x === "number" ? n.pos : { x: 0, y: 0 },
    data: {
    title: n.title,
    isRoot: n.id === rootId,
    treeId,
    parentId: n.parentId, // ✅ add this
    },
}));
}


async function refresh() {
    setLoading(true);
    try {
    const { tree: t, nodes: apiNodes } = await ensureTreeAndRoot();
    setTree(t);
    setNodes(toFlowNodes(apiNodes, t.id));
    setEdges([]); // keep clean for now
    } finally {
    setLoading(false);
    }
}

useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// ---- Node actions (these are passed into BlockNode via data) ----
const onAddChild = useCallback(
    async (parentId) => {
    if (!tree) return;

    // place child visually near parent
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

    // update backend position immediately (so reload keeps it)
    const newPos = { x: baseX + 240, y: baseY + 120 };
    await apiFetch(`/nodes/${created.id}`, {
        method: "PATCH",
        body: JSON.stringify({ pos: newPos }),
    });

    // update UI
    setNodes((prev) => [
        ...prev,
        {
        id: created.id,
        type: "block",
        position: newPos,
        data: { title: created.title, isRoot: false, treeId: tree.id, parentId },
        },
    ]);
    },
    [setNodes, tree]
);

const onDelete = useCallback(
    async (id) => {
    if (!tree) return;

    // simple confirm, no modal UI system
    if (!confirm("Delete this node? (children may become orphaned)")) return;

    await apiFetch(`/nodes/${id}`, { method: "DELETE" });

    // remove from UI
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
        prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, title } } : n))
    );
    },
    [setNodes]
);

// Inject callbacks into node data on every render (keeps nodes simple)
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

// ---- Save position on drag stop + re-parent on drop-over ----
const onNodeDragStop = useCallback(
    async (evt, dragged) => {
    // 1) persist position
    await apiFetch(`/nodes/${dragged.id}`, {
        method: "PATCH",
        body: JSON.stringify({ pos: dragged.position }),
    });

    // 2) find drop target (overlap test)
    const draggedRect = rectOfNode(dragged);
    const others = nodesRef.current.filter((n) => n.id !== dragged.id);

    let target = null;
    for (const candidate of others) {
        const r = rectOfNode(candidate);
        if (overlaps(draggedRect, r)) {
        target = candidate;
        break;
        }
    }

    // 3) if dropped on a node, re-parent. If not, parentId = null.
    // Keep existing parent unless dropped onto a target
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
    [setNodes]
);

// ---- UI ----
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
