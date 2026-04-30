import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { requireData } from "../utils/supabaseResult";

export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function loadSession() {
    const data = requireData(await supabase.auth.getSession());


    setSession(data.session);
    setAuthLoading(false);

    return data.session;
  }

  async function login({ email, password }) {
    const data = requireData(await supabase.auth.signInWithPassword({
      email,
      password,
    }));

    setSession(data.session);
    return data.session;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setSession(null);
  }

  useEffect(() => {
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setAuthLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    isLoggedIn: Boolean(session),
    authLoading,
    login,
    logout,
    loadSession,
  };
}