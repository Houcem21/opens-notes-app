export function getSavedNode(result) {
  return result?.node || result;
}

export function createNodeUpdatePayload(node, overrides = {}) {
  return {
    id: node.id,
    treeId: node.data?.treeId,
    title: node.data?.title || "Untitled",
    details: node.data?.details || "",
    parentId: node.data?.parentId ?? null,
    nodeType: node.type || node.data?.nodeType || "bubble",
    pos: node.position || { x: 0, y: 0 },
    ...overrides,
  };
}

export function createChildFlowNode({
  savedNode,
  treeId,
  parentId,
  position,
  readOnly,
  nodeType
}) {
  const resolvedNodeType =
  savedNode.node_type || savedNode.nodeType || nodeType || "bubble";

  return {
    id: savedNode.id,
    type: resolvedNodeType,
    draggable: !readOnly,
    position,
    data: {
      title: savedNode.title || "New",
      details: savedNode.details || savedNode.notes || "",
      isRoot: false,
      treeId,
      parentId,
      readOnly,
      nodeType: resolvedNodeType,
    },
  };
}

export function updateFlowNode(nodes, nodeId, updater) {
  return nodes.map((node) =>
    node.id === nodeId ? updater(node) : node
  );
}