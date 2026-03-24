"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { FlowScene } from "@/components/FlowScene";
import { ResultActionButtons } from "@/components/ResultActionButtons";
import { clampCardIndex, getMasterCardFrontSrc } from "@/lib/masterCardAssets";
import { resolveCardReading } from "@/lib/resolveCardReading";
import { buildInterpretationText } from "@/lib/tarotResultsDb";
import { FLOW_MASTERS } from "@/lib/flowData";
import { withAssetBase } from "@/lib/publicPath";

const SHARE_LINK = withAssetBase("/assets/svg-ic-share-link.svg-26940f47-d010-498b-b1e1-68303b31e59e.png");
const SHARE_KAKAO = withAssetBase("/assets/svg-ic-social-kakao.svg-20eca7d6-4d65-40b8-954f-17463d423b00.png");
const SHARE_FB = withAssetBase("/assets/svg-ic-share-facebook.svg-527221c9-1874-4fae-83ed-579ce7d4210b.png");
const SHARE_X = withAssetBase("/assets/svg-ic-share-x.svg-4ef9a083-7b44-439e-bfa4-3c305b5bf580.png");
const RESULT_BG = withAssetBase("/images/bg_final.png");

function formatBoldSegments(text: string): ReactNode {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    const m = /^\*\*(.+?)\*\*$/.exec(part);
    if (m) {
      return (
        <strong key={i} className="font-semibold text-[#f5eeff]">
          {m[1]}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Section({
  icon,
  title,
  children,
}: Readonly<{
  icon: string;
  title: string;
  children: ReactNode;
}>) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-white">
        <span aria-hidden>{icon}</span>
        {title}
      </div>
      <div className="rounded-xl border border-[#5c4a8a]/60 bg-[rgba(10,8,28,0.88)] px-3 py-3">
        <div className="text-[13px] leading-[1.65] text-[#e8e0ff]">{children}</div>
      </div>
    </div>
  );
}

function Page07ReadingResultTypeAInner() {
  const searchParams = useSearchParams();
  const params = {
    master: searchParams?.get("master") ?? undefined,
    card: searchParams?.get("card") ?? undefined,
  };
  const current =
    FLOW_MASTERS.find((m) => m.id === params.master) ?? FLOW_MASTERS[0];
  const card = params.card ?? "05";
  const cardIndex = clampCardIndex(card, 5);
  const frontCardSrc = getMasterCardFrontSrc(current.id, cardIndex);
  const reading = resolveCardReading(current.id, cardIndex);
  const interpretationText = buildInterpretationText(reading);
  const kw = reading.keywords.length ? reading.keywords.join(" · ") : "—";

  return (
    <main className="w-full">
      <FlowScene
        backgroundSrc={RESULT_BG}
        backgroundFit="cover"
        allowOverflow
        hideDimOverlay
      >
        <div className="relative min-h-[560px]">
          <div className="absolute left-1/2 -top-[10px] z-10 -translate-x-1/2 px-3 text-center text-[24px] font-semibold text-white">
            {reading.titleKo}
          </div>
          <div className="absolute left-1/2 top-[27px] z-10 -translate-x-1/2">
            <Image
              src={frontCardSrc}
              alt={`${reading.titleEn} 카드`}
              width={280}
              height={372}
              className="h-auto w-[280px] rounded-[12px] shadow-[0_20px_48px_rgba(0,0,0,0.45)]"
              priority
            />
          </div>
          <div className="absolute bottom-[172px] left-1/2 z-10 w-full max-w-[350px] -translate-x-1/2 p-3">
            <div className="pt-3 text-center text-[24px] font-semibold tracking-tight text-white">
              {reading.titleEn}
            </div>
            <div className="pt-1 text-center text-[18px] leading-snug text-[#d4c8ff]">
              {reading.cardSubtitle}
            </div>
          </div>
        </div>
      </FlowScene>

      <div className="relative z-10 -mt-[250px]">
        <section className="mx-auto w-full max-w-[350px] space-y-3 pb-2 pt-[110px]">
          <div className="space-y-[30px]">
            <Section icon="✨" title="오늘의 운세 요약">
              <p className="whitespace-pre-wrap">{formatBoldSegments(reading.summary)}</p>
            </Section>

            <Section icon="⚖️" title="부문별 운세">
              <p className="mb-2 flex gap-2">
                <span aria-hidden>💼</span>
                <span>
                  <span className="font-semibold text-[#f0e8ff]">업무/학업</span>
                  <br />
                  {formatBoldSegments(reading.categories.work)}
                </span>
              </p>
              <p className="mb-2 flex gap-2">
                <span aria-hidden>❤️</span>
                <span>
                  <span className="font-semibold text-[#f0e8ff]">애정</span>
                  <br />
                  {formatBoldSegments(reading.categories.love)}
                </span>
              </p>
              <p className="flex gap-2">
                <span aria-hidden>💰</span>
                <span>
                  <span className="font-semibold text-[#f0e8ff]">금전</span>
                  <br />
                  {formatBoldSegments(reading.categories.money)}
                </span>
              </p>
            </Section>

            <Section icon="💡" title="오늘의 조언">
              {reading.advice.quote ? (
                <p className="mb-3 border-b border-white/10 pb-3 text-[13px] font-medium leading-relaxed text-[#f2ecff] underline decoration-[#9b7dff]/50 underline-offset-4">
                  {reading.advice.quote}
                </p>
              ) : null}
              <ul className="list-none space-y-2 text-[13px]">
                <li>
                  <span className="font-semibold text-[#d8ccff]">행운의 아이템</span>
                  <br />
                  {reading.advice.luckyItem || "—"}
                </li>
                <li>
                  <span className="font-semibold text-[#d8ccff]">행운의 장소</span>
                  <br />
                  {reading.advice.luckyPlace || "—"}
                </li>
                <li>
                  <span className="font-semibold text-[#d8ccff]">주의할 점</span>
                  <br />
                  {reading.advice.caution || "—"}
                </li>
              </ul>
            </Section>

            <Section icon="💎" title="핵심 키워드">
              <p>{kw}</p>
            </Section>
          </div>

          <ResultActionButtons
            masterId={current.id}
            cardIndex={cardIndex}
            titleEn={reading.titleEn}
            titleKo={reading.titleKo}
            masterName={current.name}
            cardImagePath={frontCardSrc}
            interpretation={interpretationText}
          />

          <div className="mt-6 text-center text-[18px] text-[#d8ccff]">🧿 친구에게 공유하기</div>
          <div className="mt-3 flex justify-center gap-3">
            <Image src={SHARE_LINK} alt="" width={40} height={40} />
            <Image src={SHARE_KAKAO} alt="" width={40} height={40} />
            <Image src={SHARE_FB} alt="" width={40} height={40} />
            <Image src={SHARE_X} alt="" width={40} height={40} />
          </div>

          <div className="mt-7 rounded-xl border border-primary/40 bg-[rgba(8,7,22,0.72)] p-3">
            <div className="text-[16px] font-semibold">
              ✅ 다른 마스터의 해석 보기 (같은 카드 · {current.name} 선택 중)
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {FLOW_MASTERS.map((m) => (
                <Link
                  key={m.id}
                  href={`/page_07_reading-result_typea?master=${encodeURIComponent(m.id)}&card=${encodeURIComponent(card)}`}
                  className={`block overflow-hidden rounded-lg ring-offset-2 ring-offset-[rgba(8,7,22,0.72)] transition-opacity hover:opacity-95 ${
                    m.id === current.id ? "ring-2 ring-[#c4a8ff]" : "ring-0"
                  }`}
                  aria-current={m.id === current.id ? "page" : undefined}
                >
                  <Image
                    src={m.image}
                    alt={`${m.name} 해석 보기`}
                    width={96}
                    height={96}
                    className="h-auto w-full rounded-lg"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[350px] pb-6 pt-6">
          <Link
            href={`/page_01_masters_list_1?from=${card}`}
            className="block rounded-xl border border-primary bg-[rgba(16,12,44,0.95)] px-4 py-3 text-center text-sm font-semibold text-[#d8ccff]"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function Page07ReadingResultTypeA() {
  return (
    <Suspense fallback={null}>
      <Page07ReadingResultTypeAInner />
    </Suspense>
  );
}
