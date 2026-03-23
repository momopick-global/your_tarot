"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FlowScene } from "@/components/FlowScene";
import { FLOW_MASTERS } from "@/lib/flowData";
import { getMasterBackgroundSrc } from "@/lib/masterCardAssets";
import masterProfiles from "@/data/master-profiles.json";
import { withAssetBase } from "@/lib/publicPath";

/** JSON `diagramSrc`는 `/assets/...` 원본 — Image에 넣을 때 withAssetBase */
const DIAGRAM_FALLBACK_PATH = "/assets/master-diagrams/01_Cassian.svg";

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
        <Link href="/page_01_masters_list_1" className="mt-4 inline-block text-[#d7ccff] underline">
          마스터 목록으로
        </Link>
      </main>
    );
  }

  const diagramSrc = withAssetBase(detail.diagramSrc ?? DIAGRAM_FALLBACK_PATH);

  return (
    <main className="w-full">
      <FlowScene backHref="/page_01_masters_list_1" backgroundSrc={getMasterBackgroundSrc(current.id, 2)}>
        <div className="h-[170px]" />
        <div className="pt-3 text-center text-[28px] font-semibold text-white">{detail.name}</div>

        <div className="mt-4 rounded-xl border border-primary bg-[rgba(7,6,22,0.8)] p-3">
          <div className="mx-auto overflow-hidden rounded-lg">
            <Image src={diagramSrc} alt="성향 차트" width={300} height={300} className="h-auto w-full" />
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
          href={`/page_03_card-selection_1?master=${current.id}`}
          className="block rounded-xl bg-[#6422AB] px-4 py-3 text-center text-sm font-semibold text-white"
        >
          다음: 카드 선택 1
        </Link>
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
