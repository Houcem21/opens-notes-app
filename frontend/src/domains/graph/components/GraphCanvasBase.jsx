import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

import LoadingScreen from "../../../common/feedback/LoadingScreen";
import { NODE_TYPES, EDGE_TYPES } from "./flowTypes";
import { useTreeCanvasData } from "../hooks/useTreeCanvasData";
import { useTreeNodeActions } from "../hooks/useTreeNodeActions";

export default function GraphCanvasBase({
  loadGraph,
  readOnly = true,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
}) {
  return (
    <ReactFlowProvider>
      <TreeCanvasBaseInner
        loadGraph={loadGraph}
        readOnly={readOnly}
        onCreateNode={onCreateNode}
        onUpdateNode={onUpdateNode}
        onDeleteNode={onDeleteNode}
      />
    </ReactFlowProvider>
  );
}

function TreeCanvasBaseInner({
  loadGraph,
  readOnly,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
}) {
  const { getIntersectingNodes } = useReactFlow();

  const {
    tree,
    loading,
    nodes,
    edges,
    setNodes,
    setEdges,
    nodesRef,
    onNodesChange,
    onEdgesChange,
  } = useTreeCanvasData({ loadGraph, readOnly });

  const { addChild, deleteNode, renameNode, moveNode, updateDetails } =
    useTreeNodeActions({
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
        onUpdateDetails: updateDetails,
      },
    }));
  }, [nodes, readOnly, addChild, deleteNode, renameNode, updateDetails]);

  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && (
        <div className="canvasShell">
          <div className="canvas">
            <div className="rf">
              <ReactFlow
                nodes={flowNodes}
                edges={edges}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                fitView
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
        </div>
      )}
    </>
  );
}