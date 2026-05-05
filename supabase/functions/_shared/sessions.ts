import { sha256 } from "./crypto.ts";

export async function getValidSession(
  supabase: any,
  token: string,
  sessionType: "org" | "admin",
) {
  const tokenHash = await sha256(token);

  const { data: session, error } = await supabase
    .from("org_sessions")
    .select("organization_id, expires_at")
    .eq("token_hash", tokenHash)
    .eq("session_type", sessionType)
    .maybeSingle();

  if (error) throw error;
  if (!session) throw new Error(`Invalid ${sessionType} session`);

  if (new Date(session.expires_at).getTime() < Date.now()) {
    throw new Error(`${sessionType} session expired`);
  }

  return session;
}