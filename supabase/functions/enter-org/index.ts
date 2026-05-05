import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function createSessionToken() {
  return crypto.randomUUID() + "." + crypto.randomUUID();
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return jsonResponse({ error: "Code is required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Server configuration missing" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, slug, access_code_hash");

    if (orgError) throw orgError;

    for (const org of organizations) {
      const { data, error } = await supabase.rpc("verify_org_access_code", {
        org_id: org.id,
        raw_code: code,
      });

      if (error) throw error;

      if (data === true) {
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