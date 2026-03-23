import Image from "next/image";
import { withAssetBase } from "@/lib/publicPath";

const ABOUT_TOP_LOGO = withAssetBase("/assets/about-logo-frame214.png");

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-4 pb-6 pt-6">
        <div className="mx-auto w-full max-w-[350px]">
          <div className="mt-2 flex flex-col items-center gap-3">
            <div className="relative h-[180px] w-[175px]">
              <Image src={ABOUT_TOP_LOGO} alt="YourTarot 로고" fill className="object-contain" priority />
            </div>
          </div>

          <div className="mt-8 space-y-7 text-[16px] leading-[1.55] text-white">
            <div>
              <div className="text-[16px] font-bold leading-none">1. 서비스 소개</div>
              <p className="mt-2 text-[16px] leading-[1.45] text-[#D9DAE6]">
                당신의 질문에 카드가 답합니다
                <br />
                유어타로는 타로 카드와 함께 현재의 흐름과 운세를 확인할 수 있는 서비스입니다.
                당신이 선택한 카드 속에서 지금의 고민과 가능성을 발견해보세요.
                직관적이고 이해하기 쉬운 타로 리딩을 제공합니다.
              </p>
            </div>

            <div>
              <div className="text-[16px] font-bold leading-none">2. 유어타로 특징</div>
              <ul className="mt-2 space-y-1 text-[16px] leading-[1.45] text-[#D9DAE6]">
                <li>✓ 쉬운 타로 해설</li>
                <li>✓ 다양한 운세 리딩</li>
                <li>✓ 유명한 타로 마스터</li>
                <li>✓ 간편한 이용</li>
              </ul>
            </div>

            <div>
              <div className="text-[16px] font-bold leading-none">3. 타로의 의미</div>
              <p className="mt-2 text-[16px] leading-[1.45] text-[#D9DAE6]">
                타로는 미래를 결정하는 것이 아니라 가능성을 보여주는
                도구입니다.
                카드는 방향을 제시하고 선택은 당신이 합니다.
              </p>
            </div>

            <div>
              <div className="text-[16px] font-bold leading-none">4. 추천 대상</div>
              <ul className="mt-2 space-y-1 text-[16px] leading-[1.45] text-[#D9DAE6]">
                <li>✓ 오늘의 운세가 궁금할 때</li>
                <li>✓ 연애나 인간관계 고민이 있을 때</li>
                <li>✓ 가볍게 타로를 보고 싶을 때</li>
              </ul>
            </div>

            <div>
              <div className="text-[16px] font-bold leading-none">5. 지금 카드를 선택하세요</div>
              <p className="mt-2 text-[16px] leading-[1.45] text-[#D9DAE6]">
                카드를 선택하고
                <br />
                당신의 타로 메시지를 확인해보세요.
                <br />
                🔮 지금 당신의 운세가 시작됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

