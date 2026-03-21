"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** `public/card_swipe_mobile_demo.html` — [데모](https://your-tarot.pages.dev/card_swipe_mobile_demo)와 동일 소스 */
const DEMO_SRC = "/card_swipe_mobile_demo.html";

export function CardSwipeDemoEmbed({
  masterId,
}: Readonly<{
  masterId: string;
}>) {
  const router = useRouter();
  const [deckIndex, setDeckIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "yourtarot-swipe-demo-index" && typeof e.data.index === "number") {
        setDeckIndex(Math.max(0, Math.min(77, Math.floor(e.data.index))));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const cardParam = String(deckIndex);

  return (
    <div className="page-fade">
      <iframe
        key={iframeKey}
        src={DEMO_SRC}
        title="카드 덱 스와이프"
        className="mx-auto block h-[min(72vh,560px)] w-full max-w-[390px] border-0 bg-transparent [color-scheme:dark]"
      />

      <div className="pb-1 pt-1 text-center text-[24px] text-[#e5ddff]">⟷</div>
      <div className="pb-2 text-center text-[12px] text-[#d7ccff]">당신에게 끌리는 카드를 골라보세요</div>
      <div className="pb-6 text-center text-[11px] text-[#b9abdf]">
        선택 카드: #{String(deckIndex + 1).padStart(2, "0")}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            if (isOpening) return;
            setIsOpening(true);
            window.setTimeout(() => {
              router.push(`/page_05_masters_list5?master=${masterId}&card=${cardParam}`);
            }, 320);
          }}
          disabled={isOpening}
          className="rounded-2xl bg-[#6422AB] px-3 py-3 text-center text-[20px] font-semibold text-white disabled:opacity-70"
        >
          {isOpening ? "카드 여는 중..." : "카드 열기"}
        </button>
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          disabled={isOpening}
          className="rounded-2xl border border-primary bg-[rgba(12,10,36,0.92)] px-3 py-3 text-center text-[16px] text-[#d8ccff] disabled:opacity-70"
        >
          카드섞기
        </button>
      </div>
    </div>
  );
}
