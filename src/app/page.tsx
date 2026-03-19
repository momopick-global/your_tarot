import Image from "next/image";
import Link from "next/link";

const ICON_SHARE_LINK = "/assets/svg-ic-share-link.svg-26940f47-d010-498b-b1e1-68303b31e59e.png";
const ICON_SHARE_TALK =
  "/assets/svg-ic-social-kakao.svg-20eca7d6-4d65-40b8-954f-17463d423b00.png";
const ICON_SHARE_FACEBOOK =
  "/assets/svg-ic-share-facebook.svg-527221c9-1874-4fae-83ed-579ce7d4210b.png";
const ICON_SHARE_X =
  "/assets/svg-ic-share-x.svg-4ef9a083-7b44-439e-bfa4-3c305b5bf580.png";
const IMG_CRYSTAL_BALL = "/assets/img-visual-crystal-ball-v2.png";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[430px] px-5 pt-14">
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

        <div className="mt-7 flex items-center justify-center">
          <Link
            href="/draw/today"
            className="w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10 shadow-[0_12px_24px_rgba(100,34,171,0.35)]"
          >
            오늘의 운세 보기
          </Link>
        </div>

        <p className="mt-5 text-center text-[16px] text-white">
          지금까지 123명이 테스트했어요.
        </p>

        <div className="mt-6">
          <div className="text-center text-[14px] text-neutral-10">
            친구에게 공유하기
          </div>
          <div className="mt-4 flex items-center justify-center gap-5">
            <Image src={ICON_SHARE_LINK} alt="" width={44} height={44} />
            <Image src={ICON_SHARE_TALK} alt="" width={44} height={44} />
            <Image
              src={ICON_SHARE_FACEBOOK}
              alt=""
              width={44}
              height={44}
            />
            <Image src={ICON_SHARE_X} alt="" width={44} height={44} />
          </div>
        </div>
      </section>
    </main>
  );
}
