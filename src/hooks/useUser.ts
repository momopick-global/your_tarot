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

const OAUTH_SCOPES: Partial<Record<OAuthProvider, string>> = {
  // KOE205 방지를 위해 카카오 동의항목을 최소 범위로 명시합니다.
  kakao: "profile_nickname profile_image",
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
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(OAUTH_PENDING_KEY, "1");
    }

    const scopes = OAUTH_SCOPES[provider];

    const { error } = await supabase.auth.signInWithOAuth({
      provider: PROVIDER_MAP[provider],
      options: {
        redirectTo,
        ...(scopes ? { scopes } : {}),
      },
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
