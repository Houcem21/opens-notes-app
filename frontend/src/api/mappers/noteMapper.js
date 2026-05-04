import { timestampsFrom } from "../../common/utils/dateMapping";

export function normalizeTree(tree) {
  return {
    ...tree,
    ...timestampsFrom(tree),
  };
}

export function normalizeNode(node) {
  return {
    ...node,
    treeId: node.tree_id,
    parentId: node.parent_id,
    pos: {
      x: Number(node.pos_x || 0),
      y: Number(node.pos_y || 0),
    },
    ...timestampsFrom(node),
  };
}

export function normalizeDependency(dep) {
  return {
    ...dep,
    treeId: dep.tree_id,
    fromNodeId: dep.from_node_id,
    toNodeId: dep.to_node_id,
    ...timestampsFrom(dep),
  };
}