import Link from "next/link";

export default function PartnerPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-8 pb-4">
        <h1 className="text-[16px] font-semibold">
          📩 제휴 문의(Partnership)
        </h1>

        <p className="mt-3 text-[16px] leading-[22px] text-neutral-60">
          유어타로는 함께 새로운 경험을 만들어보세요.
          <br />
          국내외의 다양한 파트너들과 함께 성장할 수 있는 제휴 제안을
          기다립니다.
        </p>

        <div className="mt-8 rounded-xl border border-neutral-30 bg-[rgba(255,255,255,0.02)] p-5">
          <div className="flex items-center gap-2 text-[16px] font-semibold">
            <span aria-hidden>👤</span> 외화하시는 본의 정보를 알려주세요
          </div>

          <div className="mt-4 space-y-4 text-[16px]">
            <div className="space-y-1">
              <div className="text-neutral-30">회사명 / 브랜드명</div>
              <div className="h-10 rounded-lg bg-neutral-90/30 px-3 py-2 text-neutral-10">
                답답 없이 입력해주세요
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-30">담당자 이름</div>
              <div className="h-10 rounded-lg bg-neutral-90/30 px-3 py-2 text-neutral-10">
                이메일을 받는 담당자
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-30">이메일 주소</div>
              <div className="h-10 rounded-lg bg-neutral-90/30 px-3 py-2 text-neutral-10">
                예: name@company.com
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-30">웹사이트</div>
              <div className="h-10 rounded-lg bg-neutral-90/30 px-3 py-2 text-neutral-10">
                (선택)
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="text-[16px] font-semibold">📌 제휴 유형</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["콘텐츠 제휴", "브랜드 협업", "광고 제휴", "기타"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  className="h-12 rounded-xl border border-neutral-30 bg-transparent text-[16px] text-neutral-10"
                >
                  {label}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10"
          >
            문의 보내기
          </button>

          <div className="mt-4 text-[12px] text-neutral-60">
            제휴 문의는 1주 내로 답변 드립니다.
          </div>

          <Link
            href="/menu"
            className="mt-3 block w-full rounded-xl border border-neutral-30 px-5 py-3 text-center text-[16px] font-medium text-neutral-10"
          >
            메뉴로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}

