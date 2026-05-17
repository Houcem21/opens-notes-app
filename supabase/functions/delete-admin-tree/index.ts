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
    const { adminToken, treeId } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!treeId || typeof treeId !== "string") {
      return jsonResponse({ error: "Tree id is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const { error } = await supabase
      .from("trees")
      .delete()
      .eq("id", treeId)
      .eq("organization_id", session.organization_id);

    if (error) throw error;

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});