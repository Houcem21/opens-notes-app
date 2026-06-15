import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";

import {
  calculatePageRankSteps,
  getTopRankedNodes,
} from "../utils/graphAnalysis";

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

  const { addRootNode, addChild, deleteNode, renameNode, moveNode, updateDetails, connectNodes } =
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

    const [analysisRanks, setAnalysisRanks] = useState({});
    const [analysisRunning, setAnalysisRunning] = useState(false);
    const [analysisResults, setAnalysisResults] = useState([]);

    async function runPageRankAnimation() {
      if (analysisRunning || nodes.length === 0) return;

      const steps = calculatePageRankSteps(nodes, edges, {
        damping: 0.85,
        iterations: 12,
      });

      setAnalysisRunning(true);
      setAnalysisResults([]);

      for (const step of steps) {
        setAnalysisRanks(step.ranks);
        await new Promise((resolve) => setTimeout(resolve, 420));
      }

      const finalRanks = steps.at(-1)?.ranks || {};
      setAnalysisResults(getTopRankedNodes(nodes, finalRanks, 5));
      setAnalysisRunning(false);
    }

  const flowNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: !readOnly,
      data: {
        ...node.data,
        readOnly,
        analysisScore: analysisRanks[node.id] || 0,
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
            {!readOnly && mode === "graph" && (
              <button
                className="btn graphCanvasAddNodeBtn"
                type="button"
                onClick={addRootNode}
              >
                + Node
              </button>
            )}
            {!readOnly && mode === "graph" && (
              <button
                className="btn graphCanvasAnalyzeBtn"
                type="button"
                onClick={runPageRankAnimation}
                disabled={analysisRunning}
              >
                {analysisRunning ? "Analyzing..." : "Analyze Graph"}
              </button>
            )}

            {analysisResults.length > 0 && (
              <div className="graphAnalysisPanel">
                <p className="graphEyebrow">PageRank Centrality</p>
                <h3>Important assets</h3>

                {analysisResults.map((item, index) => (
                  <div className="graphAnalysisItem" key={item.id}>
                    <span>{index + 1}</span>
                    <strong>{item.title}</strong>
                    <small>{item.score.toFixed(3)}</small>
                  </div>
                ))}
              </div>
            )}
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
                connectionRadius={36}
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