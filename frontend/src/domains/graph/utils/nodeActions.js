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
}) {
  return {
    id: savedNode.id,
    type: "block",
    draggable: !readOnly,
    position,
    data: {
      title: savedNode.title || "New",
      details: savedNode.details || savedNode.notes || "",
      isRoot: false,
      treeId,
      parentId,
      readOnly,
    },
  };
}

export function updateFlowNode(nodes, nodeId, updater) {
  return nodes.map((node) =>
    node.id === nodeId ? updater(node) : node
  );
}