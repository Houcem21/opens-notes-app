import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getAdminSession(supabase: any, adminToken: string) {
  const tokenHash = await sha256(adminToken);

  const { data: session, error } = await supabase
    .from("org_sessions")
    .select("organization_id, expires_at")
    .eq("token_hash", tokenHash)
    .eq("session_type", "admin")
    .maybeSingle();

  if (error) throw error;
  if (!session) throw new Error("Invalid admin session");
  if (new Date(session.expires_at).getTime() < Date.now()) {
    throw new Error("Admin session expired");
  }

  return session;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminToken, postId } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!postId || typeof postId !== "string") {
      return jsonResponse({ error: "Post id is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const session = await getAdminSession(supabase, adminToken);

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("organization_id", session.organization_id);

    if (error) throw error;

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});