import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeParticipantCount } from "@/components/HomeParticipantCount";
import { HomeShareSection } from "@/components/HomeShareSection";
import { ROUTES } from "@/lib/routes";
import { canonicalPath, OG_IMAGE_PATH } from "@/lib/seo/pageMeta";
import { withAssetBase } from "@/lib/publicPath";

const HOME_HERO_BG = withAssetBase("/images/main_tarot1.png");

const homeOgTitle = "지금 카드가 말해 주는 오늘의 힌트 | 유어타로";
const homeOgDescription =
  "감정은 어디로 흐르고, 지금 무엇을 선택하면 좋을까요? 1분 리딩 후 바로 공유해 보세요.";

/** 루트는 title 템플릿과 중복되지 않도록 absolute 사용 */
export const metadata: Metadata = {
  title: {
    absolute: "유어타로 | 오늘의 마음과 타로 힌트",
  },
  description:
    "오늘 당신의 마음과 별의 힌트를 타로 카드로 확인하세요. 1분 안에 감정 흐름과 행동 제안을 만나볼 수 있습니다.",
  alternates: {
    canonical: canonicalPath("/"),
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "유어타로",
    title: homeOgTitle,
    description: homeOgDescription,
    url: "/",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: homeOgTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeOgTitle,
    description: homeOgDescription,
    images: [OG_IMAGE_PATH],
  },
};

const homeOutlineNavLinkClass =
  "block w-full rounded-xl border-2 border-[#6422AB] bg-transparent px-5 py-4 text-center text-[18px] font-semibold leading-snug text-[#c9b8ff] transition-colors hover:border-[#8d4ddb] hover:text-[#ddd6fe]";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative mx-auto h-[620px] w-full max-w-[390px] overflow-hidden">
        <Image src={HOME_HERO_BG} alt="" fill priority className="object-cover object-top" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,25,0.12)_0%,rgba(8,6,25,0.24)_45%,rgba(8,6,25,0.72)_100%)]" />
        <div className="absolute inset-x-0 bottom-8 z-10 px-5">
          <h1 className="text-center text-[24px] font-semibold leading-[34px] text-neutral-10">
            오늘 당신의 마음은
            <br />
            어떤 별을 품고 있나요?
          </h1>

          <p className="mt-3 text-center text-[16px] leading-[24px] text-[#d6d2ea]">
            카드가 전하는 오늘의 감정 흐름과 행동 힌트를 1분 안에 확인해 보세요.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Link
              href={ROUTES.tarotStart}
              className="w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10"
            >
              오늘의 운세 보기
            </Link>
          </div>

          <HomeParticipantCount />
        </div>
      </section>
      <section className="mx-auto w-full max-w-[390px] px-5 pb-8 pt-8">
        <nav aria-label="주요 페이지로 이동">
          <p className="text-center text-[14px] font-semibold text-[#c9b8ff]">더 알아보기</p>
          <ul className="mt-4 flex flex-col gap-3">
            <li>
              <Link href="/masters" className={homeOutlineNavLinkClass}>
                타로 마스터 9인 스타일·프로필 비교하기
              </Link>
            </li>
            <li>
              <Link href="/about" className={homeOutlineNavLinkClass}>
                유어타로 서비스 소개 읽기
              </Link>
            </li>
            <li>
              <Link href="/recommended" className={homeOutlineNavLinkClass}>
                개선 아이디어·의견 보내기
              </Link>
            </li>
          </ul>
        </nav>
      </section>
      <HomeShareSection />
    </main>
  );
}
