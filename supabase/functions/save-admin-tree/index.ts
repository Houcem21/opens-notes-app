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
    const { adminToken, tree } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!tree || typeof tree !== "object") {
      return jsonResponse({ error: "Tree is required" }, 400);
    }

    if (!tree.name || typeof tree.name !== "string") {
      return jsonResponse({ error: "Tree name is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const payload = {
      name: tree.name.trim(),
      graph_type: tree.graphType || tree.graph_type || "general",
      organization_id: session.organization_id,
      updated_at: new Date().toISOString(),
    };

    let savedTree;

    if (tree.id) {
      const { data, error } = await supabase
        .from("trees")
        .update(payload)
        .eq("id", tree.id)
        .eq("organization_id", session.organization_id)
        .select()
        .single();

      if (error) throw error;
      savedTree = data;
    } else {
      const { data, error } = await supabase
        .from("trees")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      savedTree = data;

      const { error: nodeError } = await supabase.from("nodes").insert({
        tree_id: savedTree.id,
        parent_id: null,
        title: savedTree.name,
        node_type: payload.graph_type === "tree" ? "block" : "bubble",
        notes: "",
        pos_x: 0,
        pos_y: 0,
      });

      if (nodeError) throw nodeError;
    }

    return jsonResponse({ tree: savedTree });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});