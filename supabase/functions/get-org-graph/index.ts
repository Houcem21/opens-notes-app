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
    const { orgToken, treeId } = await req.json();

    if (!orgToken || typeof orgToken !== "string") {
      return jsonResponse({ error: "Org token is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, orgToken, "org");

    let treeQuery = supabase
      .from("trees")
      .select("*")
      .eq("organization_id", session.organization_id);

    if (treeId) {
      treeQuery = treeQuery.eq("id", treeId);
    }

    const { data: tree, error: treeError } = await treeQuery
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (treeError) throw treeError;

    if (!tree) {
      return jsonResponse({
        tree: null,
        nodes: [],
        edges: [],
      });
    }

    const { data: nodes, error: nodesError } = await supabase
      .from("nodes")
      .select("*")
      .eq("tree_id", tree.id)
      .order("created_at", { ascending: true });

    if (nodesError) throw nodesError;

    const { data: edges, error: edgesError } = await supabase
      .from("edges")
      .select("*")
      .eq("tree_id", tree.id)
      .order("created_at", { ascending: true });

    if (edgesError) throw edgesError;

    return jsonResponse({
      tree,
      nodes: nodes || [],
      edges: edges || [],
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});