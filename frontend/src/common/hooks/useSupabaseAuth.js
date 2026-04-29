import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";

export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function loadSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    setSession(data.session);
    setAuthLoading(false);

    return data.session;
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

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