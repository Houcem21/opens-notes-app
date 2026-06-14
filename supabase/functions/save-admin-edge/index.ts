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
    const { adminToken, edge } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!edge || typeof edge !== "object") {
      return jsonResponse({ error: "Edge is required" }, 400);
    }

    if (!edge.treeId) {
      return jsonResponse({ error: "treeId is required" }, 400);
    }

    if (!edge.sourceNodeId || !edge.targetNodeId) {
      return jsonResponse({ error: "sourceNodeId and targetNodeId are required" }, 400);
    }

    if (edge.sourceNodeId === edge.targetNodeId) {
      return jsonResponse({ error: "Cannot connect a node to itself" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const { data: tree, error: treeError } = await supabase
      .from("trees")
      .select("id")
      .eq("id", edge.treeId)
      .eq("organization_id", session.organization_id)
      .maybeSingle();

    if (treeError) throw treeError;
    if (!tree) return jsonResponse({ error: "Tree not found" }, 404);

    const { data: sourceNode, error: sourceError } = await supabase
      .from("nodes")
      .select("id")
      .eq("id", edge.sourceNodeId)
      .eq("tree_id", tree.id)
      .maybeSingle();

    if (sourceError) throw sourceError;
    if (!sourceNode) return jsonResponse({ error: "Source node not found" }, 404);

    const { data: targetNode, error: targetError } = await supabase
      .from("nodes")
      .select("id")
      .eq("id", edge.targetNodeId)
      .eq("tree_id", tree.id)
      .maybeSingle();

    if (targetError) throw targetError;
    if (!targetNode) return jsonResponse({ error: "Target node not found" }, 404);

    const payload = {
      tree_id: tree.id,
      from_node_id: edge.sourceNodeId,
      to_node_id: edge.targetNodeId,
      edge_type: edge.type || "default",
    };

    const { data: savedEdge, error } = await supabase
      .from("edges")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({
      edge: savedEdge,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});