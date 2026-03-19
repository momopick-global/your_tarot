import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default function ResultTodayPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const { id } = params;

  // (기능 구현 단계 아님) demo id만 렌더링합니다.
  if (id !== "demo") {
    notFound();
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[430px] px-5 pt-10 pb-6">
        <h1 className="text-[18px] font-semibold">오늘의 결과</h1>
        <p className="mt-4 text-[14px] leading-[22px] text-neutral-60">
          (데모 화면) 카드와 마스터 선택 결과가 여기에 표시됩니다.
        </p>

        <div className="mt-8 rounded-xl bg-[rgba(255,255,255,0.02)] p-5">
          <div className="text-[14px] font-semibold text-neutral-10">
            요약
          </div>
          <p className="mt-2 text-[14px] leading-[22px] text-neutral-60">
            오늘은 작은 선택이 큰 흐름을 만듭니다.
          </p>

          <div className="mt-5 space-y-3">
            <div className="text-[14px] font-semibold text-neutral-10">
              애정 / 일 / 금전 / 조언
            </div>
            <div className="text-[14px] text-neutral-60">
              추후 API 또는 정적 데이터로 구성될 영역입니다.
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="block rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}

