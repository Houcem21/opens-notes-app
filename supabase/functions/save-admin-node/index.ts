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

    const { data: trees, error: treesError } = await supabase
      .from("trees")
      .select("*")
      .eq("organization_id", session.organization_id)
      .order("created_at", { ascending: true });

    if (treesError) throw treesError;

    let tree = trees?.[0];

    if (!tree) {
      const { data: createdTree, error: createTreeError } = await supabase
        .from("trees")
        .insert({
          name: "Learning",
          organization_id: session.organization_id,
        })
        .select()
        .single();

      if (createTreeError) throw createTreeError;
      tree = createdTree;
    }

    const payload = {
      tree_id: tree.id,
      parent_id: "parentId" in node ? node.parentId : null,
      title: node.title || "New",
      notes: node.notes || "",
      status: node.status || "not_started",
      priority: node.priority || "medium",
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
        .single();
    } else {
      query = supabase.from("nodes").insert(payload).select().single();
    }

    const { data: savedNode, error } = await query;

    if (error) throw error;

    return jsonResponse({
      tree,
      node: savedNode,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});