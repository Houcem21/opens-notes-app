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
    const { adminToken, edgeId } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!edgeId || typeof edgeId !== "string") {
      return jsonResponse({ error: "Edge id is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const { data: edge, error: edgeError } = await supabase
      .from("edges")
      .select("id, tree_id")
      .eq("id", edgeId)
      .maybeSingle();

    if (edgeError) throw edgeError;
    if (!edge) return jsonResponse({ error: "Edge not found" }, 404);

    const { data: tree, error: treeError } = await supabase
      .from("trees")
      .select("id")
      .eq("id", edge.tree_id)
      .eq("organization_id", session.organization_id)
      .maybeSingle();

    if (treeError) throw treeError;
    if (!tree) return jsonResponse({ error: "Tree not found" }, 404);

    const { error } = await supabase
      .from("edges")
      .delete()
      .eq("id", edgeId);

    if (error) throw error;

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});