import Link from "next/link";
import { notFound } from "next/navigation";

const ALLOWED = new Set([
  "cassian",
  "luna",
  "elin",
  "ari",
  "mira",
  "noah",
  "soren",
  "vivi",
  "astra",
]);

export function generateStaticParams() {
  return Array.from(ALLOWED).map((slug) => ({ slug }));
}

export default function MasterDetailPage({
  params,
}: Readonly<{
  params: { slug: string };
}>) {
  const { slug } = params;

  if (!ALLOWED.has(slug)) notFound();

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[430px] px-5 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold">마스터 상세</h1>
          <Link href="/masters" className="text-[14px] text-primary">
            목록
          </Link>
        </div>

        <div className="mt-6 rounded-xl bg-[rgba(255,255,255,0.02)] p-5">
          <div className="text-[14px] text-neutral-60">선택된 slug</div>
          <div className="mt-2 text-[16px] font-semibold text-neutral-10">
            {slug}
          </div>

          <p className="mt-4 text-[14px] leading-[22px] text-neutral-60">
            (기능 구현 단계 아님) 이후 마스터별 말투/덱 정보를 연결해
            카드 뽑기 화면에서 개인화를 제공합니다.
          </p>
        </div>
      </section>
    </main>
  );
}

