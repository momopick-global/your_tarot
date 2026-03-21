"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { consumeAuthReturnPath, OAUTH_PENDING_KEY } from "@/lib/authReturnPath";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * OAuth 완료 후 홈(/) 등으로 돌아왔을 때, 로그인 직전에 저장해 둔 return 경로로 이동합니다.
 * `loginWithProvider`에서 OAUTH_PENDING_KEY 를 세팅한 경우에만 동작합니다.
 */
export function AuthReturnRedirect() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;
      if (typeof window === "undefined") return;
      if (sessionStorage.getItem(OAUTH_PENDING_KEY) !== "1") return;

      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      const next = consumeAuthReturnPath();
      if (next) {
        router.replace(next);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
