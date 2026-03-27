"use client";

import Image from "next/image";
import { useState } from "react";
import { withAssetBase } from "@/lib/publicPath";

const HOME_HERO_BG = withAssetBase("/images/main/yourtarot.gif");

export function HomeHeroBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Image
        src={HOME_HERO_BG}
        alt=""
        fill
        priority
        sizes="390px"
        onLoadingComplete={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 z-0 object-cover object-top transition-opacity duration-500 ${
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
