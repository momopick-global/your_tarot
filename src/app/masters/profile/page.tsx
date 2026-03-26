"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FlowScene } from "@/components/FlowScene";
import { FLOW_MASTERS } from "@/lib/flowData";
import { getMasterBackgroundSrc } from "@/lib/masterCardAssets";
import { resolveMasterDiagramSrc } from "@/lib/masterDiagrams";
import masterProfiles from "@/data/master-profiles.json";
import { withAssetBase } from "@/lib/publicPath";
import { masterProfileWith, ROUTES, tarotDrawWithMaster } from "@/lib/routes";

type ProfileDetail = {
  name: string;
  diagramSrc?: string;
  type?: string;
  gender: string;
  job: string;
  tendencyLines: string[];
  worldviewLines: string[];
  tags: string[];
  recommendedUsers: string[];
};

function PageMasterProfile01Inner() {
  const searchParams = useSearchParams();
  const currentId = (searchParams?.get("master") ?? "cassian").toLowerCase();
  const current = FLOW_MASTERS.find((m) => m.id === currentId) ?? FLOW_MASTERS[0];
  const profiles = masterProfiles as Record<string, ProfileDetail>;
  const detail = profiles[current.id];

  if (!detail) {
    return (
      <main className="w-full px-4 py-10 text-center text-white">
        <p className="text-sm text-white/80">프로필 데이터를 찾을 수 없습니다.</p>
        <Link href={ROUTES.tarotStart} className="mt-4 inline-block text-[#d7ccff] underline">
          마스터 목록으로
        </Link>
      </main>
    );
  }

  const diagramSrc = withAssetBase(resolveMasterDiagramSrc(current.id) || detail.diagramSrc || "");

  return (
    <main className="w-full">
      <FlowScene
        backHref={ROUTES.tarotStart}
        backgroundSrc={getMasterBackgroundSrc(current.id, 2)}
        backVariant="page03"
        backLinkClassName="ml-0"
      >
        <div className="h-[170px]" />
        <div className="pt-3 text-center text-[28px] font-semibold text-white">{detail.name}</div>

        <div className="mt-4 rounded-xl border border-primary bg-[rgba(7,6,22,0.8)] p-3">
          <div className="mx-auto overflow-hidden rounded-lg">
            <Image src={diagramSrc} alt={`${detail.name} 성향 다이어그램`} width={300} height={300} className="h-auto w-full" />
          </div>
          <div className="mt-3 space-y-3 text-[13px] leading-[1.6] text-white">
            <p>✨ 이름 / 유형 / 성별 / 직업</p>
            <p className="text-[#d7ccff]">
              {detail.name} / {detail.type ?? "—"} / {detail.gender} / {detail.job}
            </p>

            <p className="pt-1">✨ 성향</p>
            <div className="space-y-2 text-[#d7ccff]">
              {detail.tendencyLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <p className="pt-1">✨ 세계관</p>
            <div className="space-y-2 text-[#d7ccff]">
              {detail.worldviewLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <p className="pt-1">✨ 관련태그</p>
            <p className="text-[#d7ccff]">{detail.tags.join(", ")}</p>

            <p className="pt-1">✨ 추천 사용자</p>
            <ul className="space-y-1 text-[#d7ccff]">
              {detail.recommendedUsers.map((item) => (
                <li key={item}>✔ {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </FlowScene>

      <div className="mx-auto w-full max-w-[390px] px-4 py-6">
        <Link
          href={tarotDrawWithMaster(current.id)}
          className="block rounded-xl bg-[#6422AB] px-4 py-3 text-center text-sm font-semibold text-white"
        >
          캐릭터 선택
        </Link>

        <div className="mt-4 rounded-xl border border-primary/40 bg-[rgba(8,7,22,0.72)] p-3 text-white">
          <div className="text-[16px] font-semibold">✅ 다른 마스터 소개 보기</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {FLOW_MASTERS.map((m) => (
              <Link
                key={m.id}
                href={masterProfileWith(m.id)}
                className={`block overflow-hidden rounded-lg ring-offset-2 ring-offset-[rgba(8,7,22,0.72)] transition-opacity hover:opacity-95 ${
                  m.id === current.id ? "ring-2 ring-[#c4a8ff]" : "ring-0"
                }`}
                aria-current={m.id === current.id ? "page" : undefined}
              >
                <Image
                  src={m.image}
                  alt={`${m.name} 소개 보기`}
                  width={96}
                  height={96}
                  className="h-auto w-full rounded-lg"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PageMasterProfile01() {
  return (
    <Suspense fallback={null}>
      <PageMasterProfile01Inner />
    </Suspense>
  );
}
