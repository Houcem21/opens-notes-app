export function toFlowNodes(apiNodes, treeId, readOnly) {
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

export function toFlowEdges(nodes) {
  return nodes
    .filter((node) => node.data?.parentId)
    .map((node) => ({
      id: `e-${node.data.parentId}-${node.id}`,
      source: node.data.parentId,
      target: node.id,
      type: "smoothstep",
    }));
}