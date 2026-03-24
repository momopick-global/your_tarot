"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_FLOW_BACKGROUND_SRC } from "@/lib/masterCardAssets";
import { withAssetBase } from "@/lib/publicPath";

const BG = DEFAULT_FLOW_BACKGROUND_SRC;
const BACK = withAssetBase("/assets/btn_back-de2e4927-d11f-4301-b319-3dee0a48266a.png");

export function FlowScene({
  children,
  backHref,
  hideBackgroundImage = false,
  backgroundSrc,
  backgroundFit = "cover",
  bottomFadeToBody = false,
  allowOverflow = false,
  hideDimOverlay = false,
  sceneClassName,
  contentClassName,
  backgroundImageClassName,
  backStyle = "image",
  backImageSrc,
  backImageSize = 52,
}: Readonly<{
  children: React.ReactNode;
  backHref?: string;
  hideBackgroundImage?: boolean;
  backgroundSrc?: string;
  backgroundFit?: "cover" | "contain";
  bottomFadeToBody?: boolean;
  allowOverflow?: boolean;
  hideDimOverlay?: boolean;
  sceneClassName?: string;
  contentClassName?: string;
  backgroundImageClassName?: string;
  backStyle?: "image" | "custom";
  backImageSrc?: string;
  backImageSize?: number;
}>) {
  const pathname = usePathname() ?? "";

  return (
    <section
      key={pathname}
      className={`page-fade relative mx-auto min-h-[560px] w-full max-w-[390px] ${
        allowOverflow ? "overflow-visible" : "overflow-hidden"
      } ${
        hideBackgroundImage ? "bg-[#07051c]" : ""
      } ${sceneClassName ?? ""}`}
    >
      {!hideBackgroundImage ? (
        <Image
          src={backgroundSrc ?? BG}
          alt=""
          fill
          className={`${backgroundFit === "contain" ? "object-contain object-top" : "object-cover object-top"} ${backgroundImageClassName ?? ""}`}
          priority
        />
      ) : null}
      {!hideDimOverlay ? (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,3,20,0.35)_0%,rgba(10,8,30,0.85)_100%)]" />
      ) : null}
      {bottomFadeToBody ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[80px] bg-gradient-to-b from-transparent to-[#202139]" />
      ) : null}

      <div className={`relative z-10 mx-auto w-full max-w-[390px] px-4 pt-4 ${contentClassName ?? ""}`}>
        {backHref ? (
          <Link
            href={backHref}
            className={
              backStyle === "custom"
                ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#8E63FF] bg-[rgba(14,10,35,0.88)]"
                : "inline-flex"
            }
            aria-label="뒤로가기"
          >
            {backStyle === "custom" ? (
              <span className="text-[22px] font-semibold leading-none text-[#BFA8FF]">←</span>
            ) : (
              <Image src={backImageSrc ?? BACK} alt="뒤로가기" width={backImageSize} height={backImageSize} />
            )}
          </Link>
        ) : null}
        {children}
      </div>
    </section>
  );
}

