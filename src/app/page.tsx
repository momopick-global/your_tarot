import Image from "next/image";
import Link from "next/link";
import { HomeParticipantCount } from "@/components/HomeParticipantCount";
import { HomeShareSection } from "@/components/HomeShareSection";
import { withAssetBase } from "@/lib/publicPath";

const IMG_CRYSTAL_BALL = withAssetBase("/assets/img-visual-crystal-ball-v2.png");

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-14">
        <h1 className="text-center text-[24px] font-semibold leading-[34px] text-neutral-10">
          오늘 당신의 마음은
          <br />
          어떤 별을 품고 있나요?
        </h1>

        <p className="mt-3 text-center text-[16px] leading-[24px] text-white">
          카드가 전하는 오늘의 감정 흐름과 행동 힌트를 1분 안에 확인해 보세요.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <Image
            src={IMG_CRYSTAL_BALL}
            alt="크리스탈볼"
            width={350}
            height={174}
            className="h-[174px] w-[350px] max-w-full object-contain"
            priority
          />
        </div>
        <p className="mt-2 text-center text-[12px] leading-[18px] text-neutral-30">
          농부가 개발중입니다
        </p>

        <div className="mt-7 flex items-center justify-center">
          <Link
            href="/page_01_masters_list_1"
            className="w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10 shadow-[0_12px_24px_rgba(100,34,171,0.35)]"
          >
            오늘의 운세 보기
          </Link>
        </div>

        <HomeParticipantCount />

      </section>
      <HomeShareSection />
    </main>
  );
}
