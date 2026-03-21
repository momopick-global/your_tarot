"use client";

import { useState } from "react";
import { CardGuidePopup } from "@/components/CardGuidePopup";
import { CardSwipeDemoEmbed } from "@/components/CardSwipeDemoEmbed";
import { FlowScene } from "@/components/FlowScene";
import { MasterIntroPopup } from "@/components/MasterIntroPopup";
import { FLOW_MASTERS } from "@/lib/flowData";

const BG_PAGE03 = "/assets/bg-page03-master.png";
const BG_CARD_OPEN = "/assets/bg2-a5c33368-f273-48af-8ec7-f18f1bc4e4f2.png";

export default function Page03CardSelection1() {
  const [master] = useState(() => {
    if (typeof window === "undefined") return "cassian";
    const m = new URL(window.location.href).searchParams.get("master");
    return m ?? "cassian";
  });
  const [isCardStage, setIsCardStage] = useState(false);
  const [isCardGuidePopupOpen, setIsCardGuidePopupOpen] = useState(false);
  const current = FLOW_MASTERS.find((m) => m.id === master) ?? FLOW_MASTERS[0];

  return (
    <main className="w-full">
      <FlowScene
        backHref="/page_01_masters_list_1"
        backgroundSrc={isCardStage ? BG_CARD_OPEN : BG_PAGE03}
        sceneClassName="h-[844px] min-h-[844px]"
        backImageSrc="/assets/btn-back-page03.png"
      >
        <div className="mx-auto min-h-[744px] w-full max-w-[350px]">
          {isCardStage ? <CardSwipeDemoEmbed masterId={current.id} /> : null}
        </div>
        {!isCardStage ? (
          <MasterIntroPopup
            master={current}
            onCardReceive={() => {
              setIsCardStage(true);
              setIsCardGuidePopupOpen(true);
            }}
          />
        ) : null}
        {isCardStage && isCardGuidePopupOpen ? (
          <CardGuidePopup onClose={() => setIsCardGuidePopupOpen(false)} />
        ) : null}
      </FlowScene>
      <div className="mx-auto h-[20px] w-full max-w-[390px] bg-[#17182E]" />
    </main>
  );
}
