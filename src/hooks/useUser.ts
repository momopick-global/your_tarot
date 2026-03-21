"use client";

import React from "react";
import type { Provider, User } from "@supabase/supabase-js";
import { OAUTH_PENDING_KEY } from "@/lib/authReturnPath";
import { getSupabaseClient } from "@/lib/supabase";

export type OAuthProvider = "google" | "kakao" | "facebook";

const PROVIDER_MAP: Record<OAuthProvider, Provider> = {
  google: "google",
  kakao: "kakao",
  facebook: "facebook",
};

export function useUser() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authReady, setAuthReady] = React.useState(false);

  React.useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      setAuthReady(false);
      return;
    }

    setAuthReady(true);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loginWithProvider = async (provider: OAuthProvider) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
    }

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/` : undefined;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(OAUTH_PENDING_KEY, "1");
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: PROVIDER_MAP[provider],
      options: { redirectTo },
    });

    if (error) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
      }
      throw error;
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    authReady,
    loginWithProvider,
    logout,
  };
}
