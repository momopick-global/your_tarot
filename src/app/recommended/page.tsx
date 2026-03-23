import Image from "next/image";
import Link from "next/link";
import { withAssetBase } from "@/lib/publicPath";

const ICON_EYE = withAssetBase("/assets/svg-logo-yourtarot.svg-699577b6-cedf-4beb-8082-e9fc60a6227c.png");

export default function RecommendedPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-8">
        <h1 className="flex items-center gap-2 text-[16px] font-semibold">
          💡 작은 아이디어라도 큰 힘이 됩니다
        </h1>

        <p className="mt-3 text-[16px] leading-[22px] text-neutral-60">
          여러분의 가장 작은 참여가 저희를 성장시킵니다. 🫶
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Image src={ICON_EYE} alt="" width={26} height={26} />
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[16px] font-semibold">
              <span aria-hidden>✉️</span> 연락처
            </div>
            <div className="mt-2 h-10 rounded-lg bg-neutral-90/30 px-3 py-2 text-[16px] text-neutral-10">
              이메일을 남겨주세요.
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[16px] font-semibold">
              <span aria-hidden>📝</span> 내용
            </div>
            <div className="mt-2 min-h-[98px] rounded-lg bg-neutral-90/30 px-3 py-3 text-[16px] text-neutral-10">
              당신의 소중한 의견을 남겨주세요.
            </div>

            <div className="mt-3 text-[12px] text-neutral-60">
              답장이 필요한 경우 체크해 주세요. 💬
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-8 w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10"
        >
          의견 보내기
        </button>

        <Link
          href="/menu"
          className="mt-3 block w-full rounded-xl border border-neutral-30 px-5 py-3 text-center text-[16px] font-medium text-neutral-10"
        >
          메뉴로 돌아가기
        </Link>
      </section>
    </main>
  );
}

