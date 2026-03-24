"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CardGuidePopup } from "@/components/CardGuidePopup";
import { CardSwipeDeck } from "@/components/CardSwipeDeck";
import { FlowScene } from "@/components/FlowScene";
import { MasterIntroPopup } from "@/components/MasterIntroPopup";
import { FLOW_MASTERS } from "@/lib/flowData";
import { getMasterBackgroundSrc } from "@/lib/masterCardAssets";
import { withAssetBase } from "@/lib/publicPath";

function Page03CardSelection1Inner() {
  const searchParams = useSearchParams();
  const master = (searchParams?.get("master") ?? "cassian").toLowerCase();
  const [isCardStage, setIsCardStage] = useState(false);
  const [isCardGuidePopupOpen, setIsCardGuidePopupOpen] = useState(false);
  const [isCardOpened, setIsCardOpened] = useState(false);
  const [isCardDropAnimating, setIsCardDropAnimating] = useState(false);
  const current = FLOW_MASTERS.find((m) => m.id === master) ?? FLOW_MASTERS[0];

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <main className="h-[100dvh] w-full overflow-hidden">
      <FlowScene
        backHref="/page_01_masters_list_1"
        backgroundSrc={
          isCardStage
            ? isCardOpened
              ? getMasterBackgroundSrc(current.id, 3)
              : getMasterBackgroundSrc(current.id, 2)
            : getMasterBackgroundSrc(current.id, 1)
        }
        sceneClassName="h-[100dvh] min-h-[100dvh] overflow-hidden"
        contentClassName="px-0"
        backgroundImageClassName={isCardStage ? "brightness-[1.08] contrast-[1.08]" : ""}
        backImageSrc={withAssetBase("/assets/btn-back-page03.png")}
        backImageSize={42}
        hideDimOverlay={isCardStage}
      >
        <div className="relative z-0 flex h-[calc(100dvh-68px)] min-h-0 w-full flex-col overflow-hidden">
          <div className="relative left-1/2 flex min-h-0 flex-1 w-screen max-w-[390px] -translate-x-1/2 flex-col">
            {/* 가이드 팝업이 닫힌 뒤에만 카드 덱 표시 */}
            {isCardStage && !isCardGuidePopupOpen ? (
              <div className={`flex min-h-0 flex-1 flex-col ${isCardDropAnimating ? "card-drop-in" : ""}`}>
                <CardSwipeDeck
                  masterId={current.id}
                  onRevealChange={(revealed) => {
                    setIsCardOpened(revealed);
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
        {!isCardStage ? (
          <MasterIntroPopup
            master={current}
            onCardReceive={() => {
              setIsCardStage(true);
              setIsCardOpened(false);
              setIsCardGuidePopupOpen(true);
            }}
          />
        ) : null}
        {isCardStage && isCardGuidePopupOpen ? (
          <CardGuidePopup
            onClose={() => {
              setIsCardGuidePopupOpen(false);
              setIsCardDropAnimating(true);
              window.setTimeout(() => setIsCardDropAnimating(false), 950);
            }}
          />
        ) : null}
      </FlowScene>
    </main>
  );
}

export default function Page03CardSelection1() {
  return (
    <Suspense fallback={null}>
      <Page03CardSelection1Inner />
    </Suspense>
  );
}
