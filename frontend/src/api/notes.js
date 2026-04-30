import { supabase } from "./supabase";
import { timestampsFrom } from "../common/utils/dateMapping";
import {requireData, requireOk} from "../common/utils/supabaseResult"

function normalizeTree(tree) {
  return {
    ...tree,
    ...timestampsFrom(tree),
  };
}

function normalizeNode(node) {
  return {
    ...node,
    id: node.id,
    treeId: node.tree_id,
    parentId: node.parent_id,
    ...timestampsFrom(node),
    pos: {
      x: Number(node.pos_x || 0),
      y: Number(node.pos_y || 0),
    },
  };
}

function normalizeDependency(dep) {
  return {
    ...dep,
    id: dep.id,
    treeId: dep.tree_id,
    fromNodeId: dep.from_node_id,
    toNodeId: dep.to_node_id,
    ...timestampsFrom(dep),
  };
}

export const notesApi = {
  // --------------------
  // Trees
  // --------------------

  async getTrees() {
    const data = requireData(
      await supabase
        .from("trees")
        .select("*")
        .order("created_at", { ascending: true })
    );

    return data.map(normalizeTree);
  },

  async createTree({ name }) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("Login required");

    const data = requireData(
      await supabase
        .from("trees")
        .insert({
          name,
          owner_id: user.id,
        })
        .select()
        .single()
    );

    return normalizeTree(data);
  },

  async updateTree(treeId, updates) {
    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.name === "string") payload.name = updates.name;

    const data = requireData(
      await supabase
        .from("trees")
        .update(payload)
        .eq("id", treeId)
        .select()
        .single()
    );

    return normalizeTree(data);
  },

  async deleteTree(treeId) {
    return requireOk(
      await supabase.from("trees").delete().eq("id", treeId)
    )
  },

  // --------------------
  // Nodes
  // --------------------

  async getNodes(treeId) {
    const data = requireData(
      await supabase
        .from("nodes")
        .select("*")
        .eq("tree_id", treeId)
        .order("created_at", { ascending: true })
    );

    return data.map(normalizeNode);
  },

  async createNode({ treeId, parentId = null, title = "New", notes = "" }) {
    const data = requireData(
      await supabase
        .from("nodes")
        .insert({
          tree_id: treeId,
          parent_id: parentId,
          title,
          notes,
          status: "not_started",
          priority: "medium",
          pos_x: 0,
          pos_y: 0,
        })
        .select()
        .single()
    );

    return normalizeNode(data);
  },

  async updateNode(nodeId, updates) {
    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.notes === "string") payload.notes = updates.notes;
    if (typeof updates.status === "string") payload.status = updates.status;
    if (typeof updates.priority === "string") payload.priority = updates.priority;

    if ("parentId" in updates) {
      payload.parent_id = updates.parentId;
    }

    if (updates.pos) {
      payload.pos_x = updates.pos.x ?? 0;
      payload.pos_y = updates.pos.y ?? 0;
    }

    const data = requireData(
      await supabase
        .from("nodes")
        .update(payload)
        .eq("id", nodeId)
        .select()
        .single()
    );

    return normalizeNode(data);
  },

  async deleteNode(nodeId) {
    return requireOk(
      await supabase.from("nodes").delete().eq("id", nodeId)
    );
  },

  // --------------------
  // Dependencies
  // --------------------

  async getDependencies(treeId) {
    const data = requireData(
      await supabase
        .from("dependencies")
        .select("*")
        .eq("tree_id", treeId)
        .order("created_at", { ascending: true })
      );

    return data.map(normalizeDependency);
  },

  async createDependency({ treeId, fromNodeId, toNodeId, type = "requires" }) {
    const data = requireData(
      await supabase
        .from("dependencies")
        .insert({
          tree_id: treeId,
          from_node_id: fromNodeId,
          to_node_id: toNodeId,
          type,
        })
        .select()
        .single()
    );

    return normalizeDependency(data);
  },

  async deleteDependency(dependencyId) {
    return requireOk(
      await supabase
      .from("dependencies")
      .delete()
      .eq("id", dependencyId)
    );
  },
};