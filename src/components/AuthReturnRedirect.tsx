"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  consumeAuthReturnPath,
  DEFAULT_AFTER_LOGIN_PATH,
  OAUTH_PENDING_KEY,
} from "@/lib/authReturnPath";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * OAuth 완료 후 홈(/) 등으로 돌아왔을 때, 로그인 직전에 저장해 둔 return 경로로 이동합니다.
 * `loginWithProvider`에서 OAUTH_PENDING_KEY 를 세팅한 경우에만 동작합니다.
 */
export function AuthReturnRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // OAuth provider redirects back to "/" in this app.
    // Restricting this effect to home prevents route flicker on normal navigation.
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(OAUTH_PENDING_KEY) !== "1") return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") return;
      if (!session?.user) return;
      if (sessionStorage.getItem(OAUTH_PENDING_KEY) !== "1") return;

      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      const next = consumeAuthReturnPath();
      router.replace(next ?? DEFAULT_AFTER_LOGIN_PATH);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
