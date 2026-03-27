"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { withAssetBase } from "@/lib/publicPath";

const HOME_HERO_BG = withAssetBase("/images/main/yourtarot.gif");

/** 느린 네트워크에서도 로딩 오버레이가 무한히 남지 않도록 상한 */
const LOAD_TIMEOUT_MS = 25_000;

export function HomeHeroBackground() {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const markLoaded = () => setLoaded(true);

  /** 이미 캐시되어 있으면 onLoad가 리스너보다 먼저 끝나 로딩이 영원히 남는 경우가 있음 */
  useLayoutEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) return;
    const t = window.setTimeout(() => setLoaded(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [loaded]);

  return (
    <>
      {/*
        큰 GIF는 모바일 Safari 등에서 next/image 래퍼와 함께 깨지거나 디코딩 실패하는 경우가 있어
        히어로만 네이티브 img로 둡니다. (용량이 크면 여전히 느릴 수 있음 → 추후 WebP/MP4 권장)
      */}
      <img
        ref={imgRef}
        src={HOME_HERO_BG}
        alt=""
        width={390}
        height={620}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={markLoaded}
        onError={markLoaded}
        className={`absolute inset-0 z-0 h-full w-full object-cover object-top transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      {!loaded ? (
        <div className="absolute inset-0 z-[15] bg-[#17182E]" aria-hidden>
          <div className="absolute left-1/2 top-[26%] w-[100px] -translate-x-1/2">
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
              <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#6422AB] home-hero-loading-bar" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
