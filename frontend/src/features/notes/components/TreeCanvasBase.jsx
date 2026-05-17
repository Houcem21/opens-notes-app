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

import CanvasSidebar from "./CanvasSidebar";
import NodeEditorModal from "./NodeEditorModal";
import { NODE_TYPES, EDGE_TYPES } from "./flowTypes";
import { useTreeNodeActions } from "../hooks/useTreeNodeActions";
import "../styles/notes.css";
import LoadingScreen from "../../../common/components/loading/LoadingScreen";

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

function TreeCanvasBaseInner({
  loadNotes,
  readOnly,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
}) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodesRef = useRef([]);
  const { getIntersectingNodes } = useReactFlow();

  const activeNode = useMemo(
    () => nodes.find((node) => node.id === activeNodeId) || null,
    [nodes, activeNodeId]
  );

  const {
    addChild,
    deleteNode,
    renameNode,
    moveNode,
    saveNodeDetails,
  } = useTreeNodeActions({
    readOnly,
    tree,
    nodesRef,
    setNodes,
    setEdges,
    getIntersectingNodes,
    onCreateNode,
    onUpdateNode,
    onDeleteNode,
  });

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

  async function refreshTree() {
    setLoading(true);

    try {
      const data = await loadNotes();
      const nextTree = data.tree || { id: null, name: "Learning" };
      const nextNodes = data.nodes || [];

      setTree(nextTree);
      setNodes(toFlowNodes(nextNodes, nextTree.id, readOnly));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadNotes]);

  const flowNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: !readOnly,
      data: {
        ...node.data,
        readOnly,
        onAddChild: addChild,
        onDelete: deleteNode,
        onRename: renameNode,
      },
    }));
  }, [nodes, readOnly, addChild, deleteNode, renameNode]);

  const openNodeEditor = useCallback(
    (event, node) => {
      if (readOnly) return;

      event.preventDefault();
      event.stopPropagation();

      setActiveNodeId(node.id);
      setEditorOpen(true);
    },
    [readOnly]
  );

  async function handleSaveNodeDetails({ title, notes }) {
    await saveNodeDetails({
      node: activeNode,
      title,
      notes,
    });

    setEditorOpen(false);
  }



  return (
    <>
      <LoadingScreen visible={loading} />
      {!loading && (
        <div className="canvasShell">
          <CanvasSidebar
            title={tree?.name}
            nodeCount={flowNodes.length}
            readOnly={readOnly}
          />

          <div className="canvas">
            <div className="rf">
              <ReactFlow
                nodes={flowNodes}
                edges={edges}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                fitView
                onNodeDoubleClick={readOnly ? undefined : openNodeEditor}
                onNodeDragStop={readOnly ? undefined : moveNode}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
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
      )}
    </>
  );
}

function toFlowNodes(apiNodes, treeId, readOnly) {
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