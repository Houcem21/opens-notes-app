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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminToken } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tokenHash = await sha256(adminToken);

    const { data: session, error: sessionError } = await supabase
      .from("org_sessions")
      .select("organization_id, expires_at")
      .eq("token_hash", tokenHash)
      .eq("session_type", "admin")
      .maybeSingle();

    if (sessionError) throw sessionError;

    if (!session) {
      return jsonResponse({ error: "Invalid admin session" }, 401);
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      return jsonResponse({ error: "Admin session expired" }, 401);
    }

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("organization_id", session.organization_id)
      .order("created_at", { ascending: true });

    if (postsError) throw postsError;

    return jsonResponse({ posts });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});