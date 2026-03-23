"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlowScene } from "@/components/FlowScene";
import { HomeShareSection } from "@/components/HomeShareSection";
import { FLOW_MASTERS } from "@/lib/flowData";
import masterProfiles from "@/data/master-profiles.json";
import { withAssetBase } from "@/lib/publicPath";

/** JSON `diagramSrc`는 `/assets/...` 원본 문자열 — 표시 시 withAssetBase 적용 */
const DIAGRAM_FALLBACK_PATH = "/assets/master-diagrams/01_Cassian.svg";
const GUIDE_POPUP_IMAGE_PATH = "/images/ch.png";

const MASTER_DETAIL_OPEN_DELAY_MS = 1000;

type ProfilePopupData = {
  diagramSrc?: string;
  type?: string;
  job?: string;
  tags?: string[];
  tendencyLines?: string[];
};

export default function Page01MastersList1() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const detailOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (detailOpenTimerRef.current) {
        clearTimeout(detailOpenTimerRef.current);
      }
    };
  }, []);
  const masters = useMemo(
    () =>
      FLOW_MASTERS.map((m) => [
        m.id,
        m.name,
        m.type,
        m.image,
      ] as const),
    [],
  );
  const current = selected
    ? FLOW_MASTERS.find((m) => m.id === selected) ?? null
    : null;
  const currentProfile = current
    ? ((masterProfiles as Record<string, ProfilePopupData>)[current.id] ?? null)
    : null;
  const popupType = currentProfile?.type ?? current?.type ?? "";
  const popupTitle = currentProfile?.job
    ? `${currentProfile.job} / ${popupType}`
    : current?.profileTitle ?? "";
  const popupTendency = currentProfile?.tendencyLines?.length
    ? currentProfile.tendencyLines.join(" ")
    : current?.desc ?? "";
  const popupTags = currentProfile?.tags?.length
    ? currentProfile.tags.join(" ")
    : "🔮 미래형 🌕 분석형 ♍ 객관형 🌙 신비형 🔮 고전형";
  const popupDiagramSrc = withAssetBase(
    current ? (currentProfile?.diagramSrc ?? DIAGRAM_FALLBACK_PATH) : DIAGRAM_FALLBACK_PATH,
  );

  return (
    <main className="w-full">
      <FlowScene hideBackgroundImage>
        

        <h1 className="mx-auto mt-3 w-full max-w-[350px] text-center text-[24px] font-semibold leading-[1.3] text-white">
          오늘의 운명을 해석할 마스터를 선택하세요
        </h1>

        <div className="mt-5 grid grid-cols-3 gap-2.5 pb-8">
          {masters.map(([id, name, kind, image]) => (
            <div key={id} className="contents">
              <button
                type="button"
                onClick={() => {
                  setSelected(id);
                  setIsDetailOpen(false);
                  if (detailOpenTimerRef.current) {
                    clearTimeout(detailOpenTimerRef.current);
                  }
                  detailOpenTimerRef.current = setTimeout(() => {
                    setIsDetailOpen(true);
                    detailOpenTimerRef.current = null;
                  }, MASTER_DETAIL_OPEN_DELAY_MS);
                }}
                className={`rounded-xl border-2 p-1 transition-colors ${
                  selected === id
                    ? "selection-glow-pulse border-primary"
                    : "border-transparent"
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={image}
                    alt={name}
                    width={96}
                    height={96}
                    className="h-auto w-full rounded-xl"
                  />
                </div>
                <div className="mt-1 text-center text-[12px] text-white">
                  {name}
                  <br />
                  <span className="text-[#cfc4ff]">({kind})</span>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-2 flex w-full max-w-[390px] justify-center pb-[40px]">
          {selected ? (
            <Link
              href={`/page_03_card-selection_1?master=${selected}`}
              className="block w-full max-w-[350px] min-h-[52px] rounded-xl bg-[#6422AB] px-5 py-3.5 text-center text-[20px] font-semibold text-white"
            >
              마스터선택 완료
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="block w-full max-w-[350px] min-h-[52px] rounded-xl bg-[#6422AB]/55 px-5 py-3.5 text-center text-[20px] font-semibold text-white/75"
            >
              마스터선택 완료
            </button>
          )}
        </div>

        {showGuide ? (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center px-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="page01-guide-title"
          >
            <div className="absolute inset-0 bg-[rgba(2,1,10,0.55)] backdrop-blur-[3px]" aria-hidden />
            <div className="relative z-10 w-full max-w-[350px] rounded-xl border border-primary bg-[rgba(9,7,28,0.94)] p-4 text-white shadow-2xl">
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="안내 닫기"
                  className="text-[22px] leading-none text-white/90 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="mb-3 flex justify-center">
                <div className="relative h-[124px] w-[124px] overflow-hidden rounded-full">
                  <Image
                    src={withAssetBase(GUIDE_POPUP_IMAGE_PATH)}
                    alt="가이드 마스터 이미지"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <p id="page01-guide-title" className="min-w-0 text-[16px] leading-[1.6] text-white">
                당신에게 가장 잘 맞는 타로 마스터를 선택하세요.
                <br />
                각 마스터는 서로 다른 방식으로 운명을 읽어 냅니다.
              </p>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-4 w-full rounded-lg bg-[#6422AB] px-3 py-2.5 text-center text-[16px] font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        ) : null}

        {current && isDetailOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5" role="dialog" aria-modal="true">
            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-[rgba(2,1,10,0.55)] backdrop-blur-[3px]"
              aria-label="마스터 상세 닫기"
            />
            <div className="relative z-10 w-full max-w-[350px] rounded-xl border border-primary bg-[rgba(9,7,28,0.94)] p-4 text-white shadow-2xl">
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  aria-label="상세 닫기"
                  className="text-[22px] leading-none text-white/90 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="flex items-start gap-3">
                <div className="relative h-[98px] w-[98px] shrink-0 overflow-hidden rounded-md">
                  <Image src={popupDiagramSrc} alt="마스터 다이어그램" fill className="object-cover" />
                </div>
                <div className="min-w-0 text-[12px] leading-[1.45]">
                  <div className="font-semibold">{popupTitle}</div>
                  <div
                    className="mt-1 overflow-hidden text-[#d6cbff]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {popupTendency}
                  </div>
                  <div
                    className="mt-2 overflow-hidden text-[#d6cbff]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {popupTags}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="rounded-lg bg-[#6422AB] px-3 py-2 text-center text-[16px] font-semibold text-white"
                >
                  캐릭터 선택
                </button>
                <Link
                  href={`/page-master-profile_01?master=${current.id}`}
                  className="rounded-lg border border-primary px-3 py-2 text-center text-[16px] text-[#d6cbff]"
                >
                  자세히 보기
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </FlowScene>
      <HomeShareSection />
    </main>
  );
}

