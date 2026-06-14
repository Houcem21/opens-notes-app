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
    const { orgToken } = await req.json();

    if (!orgToken || typeof orgToken !== "string") {
      return jsonResponse({ error: "Org token is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, orgToken, "org");

    const { data: trees, error } = await supabase
      .from("trees")
      .select("id, name, graph_type, created_at, updated_at")
      .eq("organization_id", session.organization_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return jsonResponse({ trees: trees || [] });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});