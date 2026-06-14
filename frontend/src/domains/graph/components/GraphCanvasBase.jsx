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
import { useGraphCanvasData } from "../hooks/useGraphCanvasData";
import { useGraphNodeActions } from "../hooks/useGraphNodeActions";

export default function GraphCanvasBase({
  mode = "graph",
  loadGraph,
  readOnly = true,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onCreateEdge,
  onDeleteEdge
}) {
  return (
    <ReactFlowProvider>
      <GraphCanvasBaseInner
        loadGraph={loadGraph}
        readOnly={readOnly}
        onCreateNode={onCreateNode}
        onUpdateNode={onUpdateNode}
        onDeleteNode={onDeleteNode}
        onCreateEdge={onCreateEdge}
        onDeleteEdge={onDeleteEdge}
        mode={mode}
      />
    </ReactFlowProvider>
  );
}

function GraphCanvasBaseInner({
  loadGraph,
  readOnly,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onCreateEdge,
  onDeleteEdge,
  mode
}) {
  const { getIntersectingNodes } = useReactFlow();

  const {
    graph,
    loading,
    nodes,
    edges,
    setNodes,
    setEdges,
    nodesRef,
    onNodesChange,
    onEdgesChange,
  } = useGraphCanvasData({ loadGraph, readOnly, mode });

  const { addChild, deleteNode, renameNode, moveNode, updateDetails, connectNodes } =
    useGraphNodeActions({
      readOnly,
      graph,
      mode,
      nodesRef,
      setNodes,
      setEdges,
      getIntersectingNodes,
      onCreateNode,
      onUpdateNode,
      onDeleteNode,
      onCreateEdge,
      onDeleteEdge
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
                onConnect={readOnly || mode === "tree" ? undefined : connectNodes}
                connectionLineType={mode === "tree" ? "smoothstep" : "straight"}
                onEdgesDelete={
                  readOnly
                    ? undefined
                    : (deletedEdges) => {
                        deletedEdges.forEach((edge) => onDeleteEdge?.(edge.id));
                      }
                }
                deleteKeyCode={["Backspace", "Delete"]}
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