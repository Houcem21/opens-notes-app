import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";
import { createSessionToken, sha256 } from "../_shared/crypto.ts";

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return jsonResponse({ error: "Code is required" }, 400);
    }

    const supabase = createServiceClient();

    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, slug, access_code_hash");

    if (orgError) throw orgError;

    for (const org of organizations) {
      const { data: isValid, error: verifyError } = await supabase.rpc(
        "verify_org_access_code",
        {
          org_id: org.id,
          raw_code: code,
        },
      );

      if (verifyError) throw verifyError;

      if (isValid === true) {
        const token = createSessionToken();
        const tokenHash = await sha256(token);

        const { error: sessionError } = await supabase
          .from("org_sessions")
          .insert({
            organization_id: org.id,
            session_type: "org",
            token_hash: tokenHash,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
          });

        if (sessionError) throw sessionError;

        return jsonResponse({
          token,
          organization: {
            id: org.id,
            name: org.name,
            slug: org.slug,
          },
        });
      }
    }

    return jsonResponse({ error: "Invalid organization code" }, 401);
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});