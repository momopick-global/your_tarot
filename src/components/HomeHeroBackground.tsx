"use client";

import { useState } from "react";
import { withAssetBase } from "@/lib/publicPath";

const HOME_HERO_BG = withAssetBase("/images/main/yourtarot.gif");

export function HomeHeroBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/*
        큰 GIF는 모바일 Safari 등에서 next/image 래퍼와 함께 깨지거나 디코딩 실패하는 경우가 있어
        히어로만 네이티브 img로 둡니다. (용량이 크면 여전히 느릴 수 있음 → 추후 WebP/MP4 권장)
      */}
      <img
        src={HOME_HERO_BG}
        alt=""
        width={390}
        height={620}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 z-0 h-full w-full object-cover object-top transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      {!loaded ? (
        <div
          className="absolute inset-0 z-[15] flex items-center justify-center bg-[#17182E]"
          aria-hidden
        >
          <div className="relative h-1 w-[100px] overflow-hidden rounded-full bg-white/15">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#6422AB] home-hero-loading-bar" />
          </div>
        </div>
      ) : null}
    </>
  );
}
