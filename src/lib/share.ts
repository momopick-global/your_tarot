"use client";

type KakaoSharePayload = {
  title?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
};

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (appKey: string) => void;
  Share: {
    sendDefault: (options: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: {
          mobileWebUrl: string;
          webUrl: string;
        };
      };
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

export function getCurrentShareUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

export async function copyShareUrl(url = getCurrentShareUrl()): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // fall through to legacy copy
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function openShareWindow(url: string): void {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=700");
}

function getAbsoluteImageUrl(path: string): string {
  if (typeof window === "undefined") return path;
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

async function ensureKakaoSdkLoaded(): Promise<KakaoSdk | null> {
  if (typeof window === "undefined") return null;
  if (window.Kakao) return window.Kakao;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("failed to load kakao sdk")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.async = true;
    script.dataset.kakaoSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed to load kakao sdk"));
    document.head.appendChild(script);
  });

  return window.Kakao ?? null;
}

export async function shareToKakao(payload: KakaoSharePayload = {}): Promise<boolean> {
  const url = payload.url ?? getCurrentShareUrl();
  const fallback = () => {
    const target = encodeURIComponent(url);
    openShareWindow(`https://sharer.kakao.com/talk/friends/picker/link?url=${target}`);
    return false;
  };

  try {
    const kakao = await ensureKakaoSdkLoaded();
    const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!kakao || !appKey) return fallback();

    if (!kakao.isInitialized()) {
      kakao.init(appKey);
    }

    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: payload.title ?? "유어타로 결과",
        description: payload.description ?? "당신의 운세를 확인하세요",
        imageUrl: getAbsoluteImageUrl(payload.imageUrl ?? "/images/bg_final.png"),
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
    });
    return true;
  } catch {
    return fallback();
  }
}

export function shareToFacebook(url = getCurrentShareUrl()): void {
  const target = encodeURIComponent(url);
  openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${target}`);
}

export function shareToX(url = getCurrentShareUrl()): void {
  const target = encodeURIComponent(url);
  openShareWindow(`https://x.com/intent/post?url=${target}`);
}
