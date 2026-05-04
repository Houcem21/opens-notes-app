import { supabase } from "../../api/supabase";

export async function requireCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Login required");

  return user;
}