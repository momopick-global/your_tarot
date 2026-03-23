"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FlowScene } from "@/components/FlowScene";
import { FLOW_MASTERS } from "@/lib/flowData";
import {
  getMasterBackgroundSrc,
  getMasterCardBackSrc,
  getMasterCardFrontSrc,
} from "@/lib/masterCardAssets";
import { Suspense, useMemo, useState } from "react";

function Page05MastersList5Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const masterId = (searchParams?.get("master") ?? "cassian").toLowerCase();
  const card = searchParams?.get("card") ?? "40";
  const [isOpening, setIsOpening] = useState(false);
  const current = useMemo(
    () => FLOW_MASTERS.find((m) => m.id === masterId) ?? FLOW_MASTERS[0],
    [masterId],
  );
  const cardIndex = useMemo(() => {
    const n = Number.parseInt(card, 10);
    if (!Number.isFinite(n)) return 40;
    return Math.min(77, Math.max(0, n));
  }, [card]);
  const frontCardSrc = getMasterCardFrontSrc(current.id, cardIndex);
  const backCardSrc = getMasterCardBackSrc(current.id);

  const onOpenCard = () => {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(() => {
      router.push(`/page_06_analyzing?master=${current.id}&card=${card}`);
    }, 980);
  };

  return (
    <main className="w-full">
      <FlowScene
        backHref={`/page_03_card-selection_1?master=${current.id}`}
        backgroundSrc={getMasterBackgroundSrc(current.id, 2)}
      >
        <div className="mt-10 flex min-h-[300px] items-center justify-center">
          <div className="relative h-[244px] w-[156px] [perspective:1200px]">
            <div
              className="relative h-full w-full transition-[transform,opacity] duration-[950ms] ease-out"
              style={{
                transformStyle: "preserve-3d",
                transform: isOpening ? "rotateY(360deg) scale(1.7)" : "rotateY(0deg) scale(1)",
                opacity: isOpening ? 0 : 1,
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-[#a992e2] shadow-[0_18px_32px_rgba(4,3,14,0.55)] [backface-visibility:hidden]">
                <Image src={backCardSrc} alt="카드 뒷면" fill className="object-cover" sizes="156px" />
              </div>
              <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-[#a992e2] shadow-[0_18px_32px_rgba(4,3,14,0.55)] [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <Image src={frontCardSrc} alt="카드 앞면" fill className="object-cover" sizes="156px" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-8 pt-7">
          <button
            type="button"
            onClick={onOpenCard}
            disabled={isOpening}
            className="rounded-xl bg-[#6422AB] px-3 py-3 text-center text-[20px] font-semibold text-white"
          >
            {isOpening ? "카드 여는 중..." : "카드 열기"}
          </button>
          <Link
            href={`/page_03_card-selection_1?master=${current.id}`}
            className="rounded-xl border border-primary bg-[rgba(12,10,36,0.92)] px-3 py-3 text-center text-[16px] text-[#d8ccff]"
          >
            다시 섞기
          </Link>
        </div>
      </FlowScene>
      <div className="mx-auto h-2 w-full max-w-[390px]" />
      <div className="mx-auto w-full max-w-[390px] px-4 pb-2">
        <Link
          href={`/page_06_analyzing?master=${current.id}&card=${card}`}
          className="block min-h-[48px] rounded-xl border border-primary bg-[rgba(12,10,36,0.92)] px-4 py-3 text-center text-sm font-semibold text-[#d8ccff]"
        >
          다음: 분석 화면 보기
        </Link>
      </div>
    </main>
  );
}

export default function Page05MastersList5() {
  return (
    <Suspense fallback={null}>
      <Page05MastersList5Inner />
    </Suspense>
  );
}

