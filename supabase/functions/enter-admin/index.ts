import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const { orgToken, adminCode } = await req.json();

    if (!orgToken || typeof orgToken !== "string") {
      return jsonResponse({ error: "Org token is required" }, 400);
    }

    if (!adminCode || typeof adminCode !== "string") {
      return jsonResponse({ error: "Admin code is required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Server configuration missing" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const orgTokenHash = await sha256(orgToken);

    const { data: orgSession, error: sessionError } = await supabase
      .from("org_sessions")
      .select("organization_id, expires_at")
      .eq("token_hash", orgTokenHash)
      .eq("session_type", "org")
      .maybeSingle();

    if (sessionError) throw sessionError;

    if (!orgSession) {
      return jsonResponse({ error: "Invalid org session" }, 401);
    }

    if (new Date(orgSession.expires_at).getTime() < Date.now()) {
      return jsonResponse({ error: "Org session expired" }, 401);
    }

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

    return jsonResponse({
      adminToken,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});