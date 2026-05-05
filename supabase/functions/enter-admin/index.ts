import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";
import { createSessionToken, sha256 } from "../_shared/crypto.ts";
import { getValidSession } from "../_shared/sessions.ts";

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { orgToken, adminCode } = await req.json();

    if (!orgToken || typeof orgToken !== "string") {
      return jsonResponse({ error: "Org token is required" }, 400);
    }

    if (!adminCode || typeof adminCode !== "string") {
      return jsonResponse({ error: "Admin code is required" }, 400);
    }

    const supabase = createServiceClient();
    const orgSession = await getValidSession(supabase, orgToken, "org");

    const { data: isAdminCodeValid, error: adminCodeError } =
      await supabase.rpc("verify_org_admin_code", {
        org_id: orgSession.organization_id,
        raw_code: adminCode,
      });

    if (adminCodeError) throw adminCodeError;

    if (isAdminCodeValid !== true) {
      return jsonResponse({ error: "Invalid admin code" }, 401);
    }

    const adminToken = createSessionToken();
    const adminTokenHash = await sha256(adminToken);

    const { error: insertError } = await supabase.from("org_sessions").insert({
      organization_id: orgSession.organization_id,
      session_type: "admin",
      token_hash: adminTokenHash,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    });

    if (insertError) throw insertError;

    return jsonResponse({ adminToken });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});