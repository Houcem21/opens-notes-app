import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";
import { getValidSession } from "../_shared/sessions.ts";

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminToken, node } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!node || typeof node !== "object") {
      return jsonResponse({ error: "Node is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    let tree = null;

    if (node.treeId) {
      const { data: selectedTree, error: selectedTreeError } = await supabase
        .from("trees")
        .select("*")
        .eq("id", node.treeId)
        .eq("organization_id", session.organization_id)
        .maybeSingle();

      if (selectedTreeError) throw selectedTreeError;
      if (!selectedTree) return jsonResponse({ error: "Tree not found" }, 404);

      tree = selectedTree;
    } else if (node.id) {
      const { data: existingNode, error: existingNodeError } = await supabase
        .from("nodes")
        .select("tree_id")
        .eq("id", node.id)
        .maybeSingle();

      if (existingNodeError) throw existingNodeError;
      if (!existingNode) return jsonResponse({ error: "Node not found" }, 404);

      const { data: existingTree, error: existingTreeError } = await supabase
        .from("trees")
        .select("*")
        .eq("id", existingNode.tree_id)
        .eq("organization_id", session.organization_id)
        .maybeSingle();

      if (existingTreeError) throw existingTreeError;
      if (!existingTree) return jsonResponse({ error: "Tree not found" }, 404);

      tree = existingTree;
    } else {
      return jsonResponse({ error: "treeId is required when creating a node" }, 400);
    }

    const payload = {
      tree_id: tree.id,
      parent_id: "parentId" in node ? node.parentId : null,
      title: node.title || "New",
      notes: node.details || node.notes || "",
      status: node.status || "not_started",
      priority: node.priority || "medium",
      node_type: node.nodeType || node.node_type || "bubble",
      pos_x: node.pos?.x ?? 0,
      pos_y: node.pos?.y ?? 0,
      updated_at: new Date().toISOString(),
    };

    let query;

    if (node.id) {
      query = supabase
        .from("nodes")
        .update(payload)
        .eq("id", node.id)
        .eq("tree_id", tree.id)
        .select()
        .maybeSingle();
    } else {
      query = supabase.from("nodes").insert(payload).select().single();
    }

    const { data: savedNode, error } = await query;

    if (error) throw error;

    if (!savedNode) {
      return jsonResponse({ error: "Node not found in selected tree" }, 404);
    }

    return jsonResponse({
      tree,
      node: savedNode,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});