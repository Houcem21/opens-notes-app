export function toFlowNodes(apiNodes, treeId, readOnly) {
  const rootId = apiNodes.find((node) => node.parent_id === null)?.id;

  return apiNodes.map((node) => ({
    id: node.id,
    type: node.node_type || "bubble",
    draggable: !readOnly,
    position: {
      x: Number(node.pos_x || 0),
      y: Number(node.pos_y || 0),
    },
    data: {
      title: node.title,
      details: node.details || node.notes || "",
      isRoot: node.id === rootId,
      treeId,
      parentId: node.parent_id,
      readOnly,
      nodeType: node.node_type || "bubble",
    },
  }));
}

export function toFlowEdges(apiEdges = [], mode = "graph") {
  const edgeType = mode === "tree" ? "smoothstep" : "straight";

  return apiEdges.map((edge) => ({
    id: edge.id,
    source: edge.from_node_id,
    target: edge.to_node_id,
    type: edgeType,
    data: {
      edgeType: edge.edge_type || "default",
    },
  }));
}