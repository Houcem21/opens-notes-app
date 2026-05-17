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

import NodeEditorModal from "./NodeEditorModal";

import { NODE_TYPES, EDGE_TYPES } from "./flowTypes";

import { useSession } from "../../../common/session/useSession";

import "reactflow/dist/style.css";
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

  const [editorOpen, setEditorOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);

  const activeNode = useMemo(
    () => nodes.find((node) => node.id === activeNodeId) || null,
    [nodes, activeNodeId]
  );

  const nodesRef = useRef([]);
  const { getIntersectingNodes } = useReactFlow();

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

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

  const handleNodeDoubleClick = useCallback(
    (event, node) => {
      if (readOnly) return;

      event.preventDefault();
      event.stopPropagation();

      setActiveNodeId(node.id);
      setEditorOpen(true);
    },
    [readOnly]
  );

  const handleSaveNodeDetails = useCallback(
    async ({ title, notes }) => {
      if (readOnly || !activeNode || typeof onUpdateNode !== "function") return;

      const saved = await onUpdateNode({
        id: activeNode.id,
        title,
        notes,
        parentId: activeNode.data?.parentId ?? null,
        pos: activeNode.position || { x: 0, y: 0 },
      });

      const savedNode = saved.node || saved;

      setNodes((current) =>
        current.map((node) =>
          node.id === activeNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  title: savedNode.title || title,
                  notes: savedNode.notes || notes,
                },
              }
            : node
        )
      );

      setEditorOpen(false);
    },
    [readOnly, activeNode, onUpdateNode, setNodes]
  );

  const handleAddChild = useCallback(
    async (parentId) => {
      if (readOnly || typeof onCreateNode !== "function") return;

      const parent = nodesRef.current.find((node) => node.id === parentId);

      const newPosition = {
        x: (parent?.position?.x ?? 0) + 240,
        y: (parent?.position?.y ?? 0) + 120,
      };

      const saved = await onCreateNode({
        parentId,
        title: "New",
        notes: "",
        pos: newPosition,
      });

      const savedNode = saved.node || saved;

      setNodes((current) => [
        ...current,
        {
          id: savedNode.id,
          type: "block",
          draggable: true,
          position: newPosition,
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
    [readOnly, onCreateNode, setNodes, tree?.id]
  );

  const handleDelete = useCallback(
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

  const handleRename = useCallback(
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
    [readOnly, onUpdateNode, setNodes]
  );

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

  const handleNodeDragStop = useCallback(
    async (_event, draggedNode) => {
      if (readOnly || typeof onUpdateNode !== "function") return;

      const intersections = getIntersectingNodes(draggedNode).filter(
        (node) => node.id !== draggedNode.id
      );

      const target = intersections[0] || null;

      const nextParentId = target
        ? target.id
        : draggedNode.data?.parentId ?? null;

      const saved = await onUpdateNode({
        id: draggedNode.id,
        title: draggedNode.data?.title || "Untitled",
        notes: draggedNode.data?.notes || "",
        parentId: nextParentId,
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
                  parentId: nextParentId,
                },
              }
            : node
        )
      );
    },
    [readOnly, onUpdateNode, getIntersectingNodes, setNodes]
  );

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadNotes]);

  const flowNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: !readOnly,
      data: {
        ...node.data,
        readOnly,
        onAddChild: handleAddChild,
        onDelete: handleDelete,
        onRename: handleRename,
      },
    }));
  }, [nodes, readOnly, handleAddChild, handleDelete, handleRename]);

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  return (
    <div className="canvasShell">
      <div className="sidebar" style={{background: "black"}}>
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
            onNodeDragStop={readOnly ? undefined : handleNodeDragStop}
            onNodeDoubleClick={readOnly ? undefined : handleNodeDoubleClick}
          >
            <Background />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>
      {!readOnly && (
        <NodeEditorModal
          open={editorOpen}
          node={activeNode}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveNodeDetails}
        />
      )}
    </div>
  );
}