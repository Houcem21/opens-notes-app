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
    const { adminToken, nodeId } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!nodeId || typeof nodeId !== "string") {
      return jsonResponse({ error: "Node id is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const { data: trees, error: treesError } = await supabase
      .from("trees")
      .select("id")
      .eq("organization_id", session.organization_id);

    if (treesError) throw treesError;

    const treeIds = (trees || []).map((tree) => tree.id);

    if (treeIds.length === 0) {
      return jsonResponse({ ok: true });
    }

    const { error } = await supabase
      .from("nodes")
      .delete()
      .eq("id", nodeId)
      .in("tree_id", treeIds);

    if (error) throw error;

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});