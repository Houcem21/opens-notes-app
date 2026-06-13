export function getSavedNode(result) {
  return result?.node || result;
}

export function createNodeUpdatePayload(node, overrides = {}) {
  return {
    id: node.id,
    title: node.data?.title || "Untitled",
    notes: node.data?.notes || "",
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
      notes: savedNode.notes || "",
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