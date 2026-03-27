"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import {
  AUTH_RETURN_PATH_KEY,
  sanitizeAuthReturnPath,
  setAuthReturnPathFromQuery,
} from "@/lib/authReturnPath";
import { withAssetBase } from "@/lib/publicPath";

const ICON_TALK = withAssetBase("/assets/svg-ic-social-kakao.svg-20eca7d6-4d65-40b8-954f-17463d423b00.png");
const ICON_FACEBOOK = withAssetBase(
  "/assets/svg-ic-share-facebook.svg-527221c9-1874-4fae-83ed-579ce7d4210b.png",
);

function parseReturnToParam(raw: string | null): string | null {
  if (raw == null || raw === "") return null;
  try {
    return sanitizeAuthReturnPath(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithProvider, user, loading } = useUser();

  const returnToSafe = useMemo(
    () => parseReturnToParam(searchParams?.get("returnTo") ?? null),
    [searchParams],
  );

  /** returnTo 쿼리 ↔ sessionStorage 동기화 (OAuth 후 복귀용) */
  useEffect(() => {
    const raw = searchParams?.get("returnTo") ?? null;
    if (raw) {
      setAuthReturnPathFromQuery(raw);
    } else if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
    }
  }, [searchParams]);

  /** 이미 로그인된 채로 /login?returnTo= 로 들어온 경우 즉시 복귀 */
  useEffect(() => {
    if (loading) return;
    if (!user || !returnToSafe) return;
    router.replace(returnToSafe);
  }, [user, loading, returnToSafe, router]);

  const onSocialLogin = async (provider: "google" | "kakao" | "facebook") => {
    try {
      await loginWithProvider(provider);
    } catch (error) {
      const defaultMessage =
        provider === "kakao" ? "카카오 로그인에 실패했어요." : "로그인 중 문제가 발생했습니다.";
      const message = error instanceof Error ? error.message || defaultMessage : defaultMessage;
      window.alert(message);
    }
  };

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-10">
        <h1 className="text-center text-[26px] font-semibold leading-[36px]">
          로그인을 통해
          <br />
          당신의 별을 더 오래 기억해요.
        </h1>

        <p className="mt-4 text-center text-[16px] leading-[22px] text-neutral-60">
          로그인하면 결과 저장과 맞춤 힌트를 이어서 받을 수 있어요.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => onSocialLogin("google")}
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-neutral-10 text-[16px] font-semibold text-neutral-90"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ffffff] text-[18px] font-bold">
              G
            </span>
            구글 로그인
          </button>

          <button
            type="button"
            onClick={() => onSocialLogin("kakao")}
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-accent text-[16px] font-semibold text-neutral-90"
          >
            <Image src={ICON_TALK} alt="" width={26} height={26} />
            카카오톡 로그인
          </button>

          <button
            type="button"
            onClick={() => onSocialLogin("facebook")}
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#3b72ff] text-[16px] font-semibold text-neutral-10"
          >
            <Image src={ICON_FACEBOOK} alt="" width={26} height={26} />
            페이스북 로그인
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
          <span className="text-[22px]">🔔</span>
          <p className="text-center text-[13px] leading-[20px] text-neutral-60">
            가입을 완료하면 모모피의 이용약관과 개인정보처리방침에
            <br />
            동의하게 됩니다.
          </p>
        </div>

      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-5 pt-14 text-center text-[16px] text-neutral-60">로딩 중…</main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
